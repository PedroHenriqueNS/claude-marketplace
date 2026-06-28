# Liveness and readiness health probes

A service exposes **two** Kubernetes-style probes, never one combined `/health`:

- **`GET /health/live`** — liveness. **No dependencies.** `health.check([])` (terminus returns `ok` while
  the process responds). A failing liveness probe makes Kubernetes **restart** the pod.
- **`GET /health/ready`** — readiness. Checks the real dependencies (DB ping, broker, cache, …) **plus a
  manipulable readiness flag**. A failing readiness probe makes Kubernetes **stop routing traffic** to the
  pod (remove it from Service endpoints) but does **not** restart it.

Templates: `templates/health/` — `readiness.service.ts`, `readiness.module.ts`,
`readiness-shutdown.hook.ts`, `readiness.health.ts`, `health.controller.ts`, `health.module.ts`.

```typescript
// WRONG — one endpoint that checks the DB and is used for BOTH probes
@Get("health")
@HealthCheck()
check() {
  return this.health.check([() => this.db.pingCheck("database")]);
}
// A transient DB blip now fails the LIVENESS probe too → Kubernetes restarts a healthy pod → crash loop.
```

```typescript
// RIGHT — split. Liveness has zero dependencies; readiness has the deps + the drain flag.
@Get("live")  @HealthCheck() live()  { return this.health.check([]); }
@Get("ready") @HealthCheck() ready() {
  return this.health.check([
    () => this.db.pingCheck("database"),
    () => this.readiness.check("readiness"), // the manipulable flag
  ]);
}
```

## Liveness checks NOTHING (the one rule that matters most)

If `/health/live` checks the DB or broker, a recoverable dependency outage becomes a **restart loop** —
Kubernetes kills pods that were fine. Dependencies belong in **readiness** only. Resist adding a
memory/heap check to liveness without a concrete, measured reason.

## Graceful drain: flip readiness BEFORE draining

A global `ReadinessService` holds the flag. On `SIGTERM`, `markNotReady()` runs **first** — before any
in-flight drain — so the sequence is: flag flips → readiness probe 503 → Kubernetes stops routing → *then*
drain and exit. Draining first means the load balancer keeps feeding new requests into a dying pod.

Order is guaranteed only if the flip is the **first line of the same handler that drains**. A standalone
`BeforeApplicationShutdown` hook can't guarantee it runs before another module's drain (`OnModuleDestroy`
on the outbox drainer, etc.) — if you have a central drain/shutdown service, call `markNotReady()` there
first. The `ReadinessService` is `@Global` so both the health indicator and the shutdown layer share one
instance without the route-module leaking into infra.

## Silence probe logs by User-Agent, scoped to the probe paths

kubelet sets `User-Agent: kube-probe/<version>` on `httpGet` probes. Silence probe **success** logs only
when it is BOTH a probe path AND that UA — `req.path.startsWith("/health/") && (userAgent).startsWith("kube-probe/")`.
The **UA** (not the URL alone) is what tells a probe apart from a human curling `/health`: that human lacks
the `kube-probe` UA, so they still log. The **path** scope then stops an attacker from spoofing
`User-Agent: kube-probe/...` on an application route to suppress its access log (audit-trail evasion) — UA
alone would let any request mute its own log. **Keep the failure log**: a failing readiness is real signal
(and during a graceful drain, readiness *intentionally* 503s for a few seconds). See `logging-cls` and
`templates/core/logging.interceptor.ts`.

## Probes carry no auth

Probes send no API key or bearer token. The health controller must be reachable keyless: it does **not**
extend `BaseController` (so the layered guards don't apply) **and** carries `@SkipApiKey()` + `@PublicRoute()`
to also cover the case where the guards are registered as `APP_GUARD`s (`auth-layered-guards`). Exclude
`health` from the global prefix in `main.ts` so the paths stay `/health/live` and `/health/ready`.

## Kubernetes wiring

Only **`httpGet`** probes issue an HTTP request (and the `kube-probe` UA) — `exec`/`tcpSocket` won't trigger
the log-silencing or evaluate the readiness body. Use a **fast readiness cadence** so the drain flip is
noticed in seconds, and make sure `terminationGracePeriodSeconds` covers *notice + drain*.

```yaml
livenessProbe:
  httpGet: { path: /health/live, port: http }
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /health/ready, port: http }
  periodSeconds: 5          # fast: the shutdown flip must be noticed quickly
  failureThreshold: 2
# terminationGracePeriodSeconds (default 30) must exceed (periodSeconds × failureThreshold) + drain time.
```

## `@nestjs/terminus` version + API

Pin `@nestjs/terminus` to the NestJS major (terminus 11 ↔ NestJS 11), like any companion package. On
terminus 11 a custom indicator injects `HealthIndicatorService` and returns `indicator.up()` / `.down()` —
the pre-v11 `extends HealthIndicator` + `throw new HealthCheckError(...)` is removed; don't reintroduce it.
