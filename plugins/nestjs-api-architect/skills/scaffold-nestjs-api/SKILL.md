---
name: scaffold-nestjs-api
description: >-
  Bootstrap a brand-new NestJS API as a Domain-Driven Design layered service — the @core/ +
  shared/ foundation, base classes (BaseClass/BaseService/BaseController), Zod-validated config,
  layered auth guards, exception filter, logging + idempotency interceptors, health check, and
  Swagger. Use this skill WHENEVER the user wants to scaffold, bootstrap, start, set up, or
  initialize a new NestJS API, service, backend, or project from scratch — e.g. "spin up a new
  Nest service", "set up a NestJS backend with DDD/clean architecture", "create the foundation for
  a new API". For adding pieces to an EXISTING api use add-nestjs-module / add-nestjs-use-case /
  add-nestjs-shared-op / add-nestjs-migration instead.
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# Scaffold a new NestJS API (DDD foundation)

This produces the skeleton every feature later plugs into. Read the architecture rules first —
`../nestjs-api-architect/rules/arch-ddd-layers.md` and `arch-per-operation-layers.md` — then emit the
tree below from the templates in `../nestjs-api-architect/templates/core/`.

## Target structure

```
src/
├── main.ts                      # bootstrap: Helmet, Swagger at /docs, global prefix, enableShutdownHooks()
├── app.module.ts                # wires @core globals + feature modules (none yet)
├── @core/                       # INFRASTRUCTURE
│   ├── config/                  # config.module.ts, env.schema.ts, env.service.ts   ← templates/core
│   ├── db/                      # database.module.ts, data-source.ts, migrations/
│   ├── decorators/              # decorators.ts (@PublicRoute, @SkipApiKey, @Idempotent, @CurrentUser, @MaskLogger)
│   ├── auth/                    # authenticated-user.type.ts (the @CurrentUser() return type)
│   ├── entities/                # (empty — first entity arrives with the first feature)
│   ├── exceptions/              # base.exception.ts
│   ├── filters/                 # custom-exception.filter.ts
│   ├── guards/                  # api-key.guard.ts, jwt.guard.ts (+ jwt strategy)
│   ├── interceptors/            # logging.interceptor.ts, idempotency-key.interceptor.ts, http-metrics.interceptor.ts
│   ├── loggers/                 # custom-logger.ts
│   ├── readiness/               # readiness.service + module + shutdown hook (the drain flag)   ← templates/health
│   └── redis/                   # redis.module.ts (only if events/idempotency/cache are in scope)
├── shared/
│   ├── base/                    # base-class.ts, base-service.ts, base-controller.ts
│   ├── api-docs/                # ApiHealthCheckDoc + dtos/ (cross-cutting doc helpers)
│   └── constants/               # enums (ubiquitous language)
└── modules/
    ├── metrics/                 # GET /metrics (willsoto + Node defaults + HTTP RED)   ← templates/metrics
    └── health/                  # liveness + readiness probes (GET /health/live, /health/ready)   ← templates/health
```

## Steps

1. **Init** the Nest project (or confirm it exists), TypeScript strict, Yarn/PNPM per the repo. Add the `@/*` → `src/*` path alias the templates import through — `"paths": { "@/*": ["./src/*"] }` in `tsconfig.json` (relative target, so no `baseUrl`; `baseUrl` is deprecated on TS 6) plus a runtime resolver (`tsconfig-paths`, or `tsConfigPath` in `nest-cli.json`).
2. **Spine** — copy `base-class.ts`, `base-service.ts`, `base-controller.ts` into `src/shared/base/`. Everything else depends on these.
3. **Config** — copy `env.schema.ts` + `env.service.ts`; wrap them in a `@Global() ConfigModule`. The app must fail fast at boot on bad env (`config-env-zod`).
4. **Decorators** — copy `decorators.ts` into `@core/decorators/`.
5. **Auth** — copy `api-key.guard.ts` + `jwt.guard.ts`; register both as `APP_GUARD`s (or apply via `BaseController`). Add the JWT strategy wired to your IdP's JWKS, the `IDP_ISSUER` / `IDP_JWKS_URI` env vars it reads, and `authenticated-user.type.ts` in `@core/auth/` (the `@CurrentUser()` return type) (`auth-layered-guards`).
6. **Errors + logging** — copy `base.exception.ts`, `custom-exception.filter.ts` (as `APP_FILTER`), `custom-logger.ts`, `logging.interceptor.ts` (as `APP_INTERCEPTOR`).
7. **Idempotency** — copy `idempotency-key.interceptor.ts` if any mutating endpoints are coming (they are). Needs Redis (`spot-idempotency-outbox`).
8. **Database** — `DatabaseModule` + standalone `data-source.ts`, `synchronize:false`, empty `migrations/` (`entities-and-migrations`).
9. **Health** — `modules/health/` with **two** probes from `templates/health/`: `GET /health/live` = `health.check([])` (NO deps, H1) and `GET /health/ready` = `health.check([db.pingCheck, …, readiness])`. Add the `@Global` `ReadinessModule` (the drain flag) to `@core/readiness/` and import it in the root module; flip it to not-ready *first* on shutdown (H4). Keyless — `@SkipApiKey()` + `@PublicRoute()`, does NOT extend `BaseController`. Pin `@nestjs/terminus` to the NestJS major. See `rules/health-liveness-readiness.md`.
10. **Metrics** — `modules/metrics/` from `templates/metrics/`: a `@Global` `MetricsModule` registers `@willsoto/nestjs-prometheus` with a keyless `PublicMetricsController` (extends `PrometheusController`; `@SkipApiKey()` + `@PublicRoute()`), `defaultMetrics: { enabled: true }` (Node metrics), and the three HTTP RED series. Register `HttpMetricsInterceptor` (in `@core/interceptors/`) as an `APP_INTERCEPTOR`. Pin `@willsoto/nestjs-prometheus` to the NestJS major; keep `prom-client` a direct dep. See `rules/metrics-prometheus.md`.
11. **`main.ts`** — Helmet, `app.setGlobalPrefix(...)` (exclude `/metrics` **and** `health` so probes stay at `/health/live` & `/health/ready`), Swagger at `/docs` with API-key security, `app.enableShutdownHooks()`.
12. **Verify** — `build` + `lint` pass; `GET /health/live` returns 200 (even with the DB down), `GET /health/ready` reflects deps + the flag, `GET /metrics` returns 200 keyless with the `http_*` series; Swagger renders. Do NOT add a global `ValidationPipe` (`validation-baseservice`).

Then hand off to `add-nestjs-module` for the first real feature.
