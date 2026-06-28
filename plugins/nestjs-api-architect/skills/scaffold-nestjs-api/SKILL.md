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
│   ├── entities/                # (empty — first entity arrives with the first feature)
│   ├── exceptions/              # base.exception.ts
│   ├── filters/                 # custom-exception.filter.ts
│   ├── guards/                  # api-key.guard.ts, jwt.guard.ts (+ jwt strategy)
│   ├── interceptors/            # logging.interceptor.ts, idempotency-key.interceptor.ts
│   ├── loggers/                 # custom-logger.ts
│   └── redis/                   # redis.module.ts (only if events/idempotency/cache are in scope)
├── shared/
│   ├── base/                    # base-class.ts, base-service.ts, base-controller.ts
│   ├── api-docs/                # ApiHealthCheckDoc + dtos/ (cross-cutting doc helpers)
│   └── constants/               # enums (ubiquitous language)
└── modules/
    └── health/                  # one real feature to prove the wiring (GET /health via terminus)
```

## Steps

1. **Init** the Nest project (or confirm it exists), TypeScript strict, Yarn/PNPM per the repo.
2. **Spine** — copy `base-class.ts`, `base-service.ts`, `base-controller.ts` into `src/shared/base/`. Everything else depends on these.
3. **Config** — copy `env.schema.ts` + `env.service.ts`; wrap them in a `@Global() ConfigModule`. The app must fail fast at boot on bad env (`config-env-zod`).
4. **Decorators** — copy `decorators.ts` into `@core/decorators/`.
5. **Auth** — copy `api-key.guard.ts` + `jwt.guard.ts`; register both as `APP_GUARD`s (or apply via `BaseController`). Add the JWT strategy wired to your IdP's JWKS (`auth-layered-guards`).
6. **Errors + logging** — copy `base.exception.ts`, `custom-exception.filter.ts` (as `APP_FILTER`), `custom-logger.ts`, `logging.interceptor.ts` (as `APP_INTERCEPTOR`).
7. **Idempotency** — copy `idempotency-key.interceptor.ts` if any mutating endpoints are coming (they are). Needs Redis (`spot-idempotency-outbox`).
8. **Database** — `DatabaseModule` + standalone `data-source.ts`, `synchronize:false`, empty `migrations/` (`entities-and-migrations`).
9. **Health** — a real `modules/health/` feature with a terminus DB ping, `@SkipApiKey()` + `@PublicRoute()`, excluded from request logging.
10. **`main.ts`** — Helmet, `app.setGlobalPrefix(...)` (exclude `/metrics`), Swagger at `/docs` with API-key security, `app.enableShutdownHooks()`.
11. **Verify** — `build` + `lint` pass; `GET /health` returns 200; Swagger renders. Do NOT add a global `ValidationPipe` (`validation-baseservice`).

Then hand off to `add-nestjs-module` for the first real feature.
