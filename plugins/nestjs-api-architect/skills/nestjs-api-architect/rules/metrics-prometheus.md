# Prometheus `/metrics` endpoint

Every HTTP service exposes one standardized `GET /metrics`, served by **`@willsoto/nestjs-prometheus`**
(not hand-rolled `prom-client`), exposing **Node.js default metrics** + the **three HTTP RED series**.
Those series are a **fleet-wide contract**: same names, labels, `help`, and histogram buckets on every
service, so one set of Grafana dashboards and alerts works everywhere. Don't rename, relabel, or rebucket.

Templates: `templates/metrics/` — `metrics.module.ts` (registers willsoto + the series), `metrics.service.ts`
(a thin facade over the injected metrics), `public-metrics.controller.ts` (the keyless route),
`http-metrics.interceptor.ts` (records the RED metrics). The interceptor registers as a global
`APP_INTERCEPTOR`, separate from `LoggingInterceptor` — one concern each.

The three mandatory series (copy byte-for-byte):

| Series | Type | Labels | Notes |
|---|---|---|---|
| `http_requests_total` | counter | `method`, `route`, `status_code` | |
| `http_request_duration_seconds` | histogram | `method`, `route`, `status_code` | buckets `[.005 .01 .025 .05 .1 .25 .5 1 2.5 5 10]` |
| `http_requests_in_flight` | gauge | — | a single global in-flight count |

Broker/domain series are **per-project** — add them where that system exists (this architecture's events
flow over Redis Streams, `events-redis-streams`), and **never invent a broker that isn't there**.

## `/metrics` must stay keyless

Prometheus scrapers send no credentials. willsoto's built-in controller carries no exemption, so register
a custom `PublicMetricsController extends PrometheusController` that's reachable without auth — same pattern
as the health controller: it doesn't extend `BaseController` **and** carries `@SkipApiKey()` + `@PublicRoute()`
(`auth-layered-guards`, `health-liveness-readiness`). Exclude `metrics` from the global prefix in `main.ts`
so the path stays `/metrics`, and keep it in `logging.interceptor.ts`'s silent routes (scrape noise).

## The `route` label is the templated pattern, never the raw URL

Label with the matched route **pattern** (`req.route?.path` on Express → `/users/:id`; `request.routeOptions?.url`
on Fastify), never `req.url`/`req.originalUrl`. A raw URL mints a new series per id/query-string and blows
up Prometheus cardinality. Unmatched routes → `route="unknown"`; the interceptor skips `/metrics` itself so
self-scrapes don't inflate counters.

## Two subtleties the interceptor must get right

- **In-flight gauge decrements in `finalize`, not `tap`.** `tap` doesn't fire on unsubscribe (client
  disconnect), so decrementing there leaks the gauge. `finalize` fires on complete, error, AND unsubscribe.
  Increment once at entry, *after* the non-HTTP and `/metrics` early-returns, so skipped paths never inc.
- **Error `status_code` comes from the exception, not `res.statusCode`.** When the stream errors the
  exception filter hasn't written the status yet, so `res.statusCode` is stale (often 200). Derive it:
  `err instanceof HttpException ? err.getStatus() : 500` — and test the 500 fallback, the branch most likely
  to regress.

## Serving details

Enable Node defaults **once** via willsoto's `defaultMetrics: { enabled: true }` — never also call
`collectDefaultMetrics(...)` (double registration crashes at boot). Register `PrometheusModule` + every
`make*Provider` inside the one `@Global` `MetricsModule` so the `@InjectMetric` tokens and the exported
`MetricsService` resolve consistently — don't scatter `register()` across feature modules.

## Versioning + scrape

Pin `@willsoto/nestjs-prometheus` to the NestJS major and keep `prom-client` a direct dep at the peered
major (the facade's `Counter`/`Gauge`/`Histogram` types import from it). Scrape via a Prometheus-Operator
`ServiceMonitor`, gated behind a values flag (the CRD is often prod-only); pod annotations
(`prometheus.io/scrape|path|port`) are the plain-Prometheus alternative.

```yaml
# values: metrics.serviceMonitor.enabled=false by default; true in the prod values file
{{- if .Values.metrics.serviceMonitor.enabled }}
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata: { name: {{ include "<chart>.fullname" . }} }
spec:
  selector: { matchLabels: {{- include "<chart>.selectorLabels" . | nindent 6 }} }
  endpoints:
    - port: {{ .Values.metrics.serviceMonitor.port | default "http" }}
      path: /metrics
      interval: {{ .Values.metrics.serviceMonitor.interval | default "30s" }}
{{- end }}
```
