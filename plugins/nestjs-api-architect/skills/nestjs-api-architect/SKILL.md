---
name: nestjs-api-architect
description: >-
  Use for any change inside a NestJS / @nestjs API codebase — this is the project's house
  architecture, so edits to it should follow this skill. Reach for it when: adding or changing
  a POST/GET endpoint, controller, or route; creating or wiring a feature module; writing DTOs
  and validation; adding a TypeORM entity or migration (e.g. a new column); splitting a fat,
  mixed-concern service and deciding where business logic belongs vs. the controller; fixing
  inconsistent HTTP error shapes, status codes, or 500s that leak stack traces via an exception
  filter; making a webhook or other mutating endpoint idempotent against retries/duplicates; or
  adding Swagger docs, guards, auth, domain events, or workers. Use it for one-line edits as much
  as new features, and whether or not the user says "architecture" or "best practices." Not for
  other stacks — Angular @Injectable, plain Express, Spring Boot, standalone Apollo/GraphQL — or
  generic TypeScript questions with no NestJS context.
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# NestJS API Architect (DDD)

Build and maintain NestJS APIs as a **Domain-Driven Design** layered system. This skill is the
canonical rulebook + template library for that architecture. Read the relevant `rules/<name>.md`
before writing or reviewing code in that area, and copy from `templates/` instead of hand-rolling
boilerplate.

The patterns here are battle-tested on a real production API. Examples reference that codebase
(*"gigabase"*) as the worked reference implementation, but every rule and template is written to be
reused on any NestJS project — project-only choices (the identity provider, the edge gateway) are
generalized and called out where they appear.

## When to use

Invoke this skill for **any** NestJS work, not just when "best practices" are requested:

- Writing or editing a controller, service, module, DTO, guard, interceptor, filter, entity, or migration
- Reviewing or refactoring NestJS code, or debugging a Nest bootstrap / DI / validation issue
- Designing a feature, a bounded context, or a use case in a Nest API
- Scaffolding a new API or a new layer (use the scaffolding skills — see below)
- Any mention of NestJS, DDD, domain-driven design, use cases, clean architecture, TypeORM, or an API backend

## The DDD layer map

Every feature is a **bounded context** (a Nest module under `src/modules/<feature>/`). Code is split
into three layers; dependencies only ever point inward (application → domain ← infrastructure):

```
src/
├── @core/                       # INFRASTRUCTURE (framework) — config, db, guards, filters,
│                                #   interceptors, loggers, redis, workers. Global, wired once.
├── shared/                      # INFRASTRUCTURE (domain support) + the building blocks
│   ├── base/                    #   BaseClass, BaseService, BaseController — the spine
│   ├── repositories/            #   persistence, one per-operation dir per entity
│   ├── gateways/                #   ANTI-CORRUPTION LAYER to external systems (IdP, mailer, storage)
│   ├── factories/               #   pure domain factories (hashing, code generation, ...)
│   ├── api-docs/                #   cross-cutting Api<Route>Doc helpers
│   └── constants/               #   enums (the domain vocabulary), shared value sets
└── modules/<feature>/           # one BOUNDED CONTEXT per feature
    ├── application/             #   APPLICATION LAYER — controller (delivery) + HTTP DTOs + dtos/<route>.dto
    └── domain/<use-case>/       #   DOMAIN LAYER — one use case = one BaseService + input + output + module
```

| DDD concept | Where it lives in the code |
|---|---|
| Bounded context | a feature module (`modules/<feature>/`), owns its `v1/<feature>` route prefix |
| Domain layer | `domain/<use-case>/` — use cases as domain services (`BaseService<Input, Output>`) |
| Aggregate / entity | a TypeORM entity in `@core/entities/`; counters in `<entity>_insights` tables |
| Value objects at the boundary | `Input` / `Output` classes (`extends BaseClass`), constructed only via `XInput.of({...})` |
| Application layer | `application/` — the controller is a thin delivery mechanism: route + input + call |
| Infrastructure | `@core/` (framework) + `shared/repositories` (persistence) |
| Anti-corruption layer | `shared/gateways/` — the only code that talks to an external system's API |
| Domain events | the transactional **outbox** (never published directly from a use case) |
| Ubiquitous language | enums in `shared/constants/` — runtime-emitted, never erased `type` unions |

## Rules — quick reference

Each rule is a focused file under `rules/`. **Read the file before applying or reviewing the rule.**
Full index with one-liners: `rules/_index.md`.

| Category | Rule file | The rule in one line |
|---|---|---|
| Architecture | `arch-ddd-layers` | Domain / application / infrastructure split; dependencies point inward |
| Architecture | `arch-per-operation-layers` | Repos/gateways/factories are per-operation dirs, 3-level module chain, no `@Global`, no aggregator |
| Architecture | `arch-route-prefixes` | A controller's prefix = its owning module; never serve a route under another module's prefix |
| Application | `controllers-thin` | Controllers do route + input + call. No mapping, no casts, no branching |
| Application | `swagger-doc-helpers` | Every route's Swagger lives in one `Api<Route>Doc()` `applyDecorators` helper — Swagger-only |
| Application | `api-property-on-io` | `@ApiProperty`/`@ApiPropertyOptional` on every body-sourced `Input`/`Output` field |
| Application | `http-status-enum` | Use the `HttpStatus` enum, never numeric status literals |
| Application | `void-endpoints-204` | No-body endpoints return `Promise<void>` + `@HttpCode(204)`, never `return {}` |
| Domain model | `runtime-emitted-constructs` | Prefer `enum`/`class`/`abstract class` over `type`/`interface` (they survive to runtime) |
| Domain model | `inputs-input-of` | Wrap every repo/gateway/factory/service call's input in `XInput.of({...})`; never `as never` |
| Domain model | `validation-baseservice` | Validation is owned by `BaseService.execute`; never add a global `ValidationPipe` |
| Domain model | `outputs-not-validated` | Outputs are not validated at runtime; `Output` extends `BaseClass` for typed construction only |
| Domain model | `services-and-transactions` | One use case = one `BaseService`, implement `perform()`; transactions thread `txEntityManager` |
| Persistence | `entities-and-migrations` | `synchronize:false` + `createForeignKeyConstraints:false` always; migrations own all DDL |
| Security | `auth-layered-guards` | Layered perimeter (edge key) + identity (JWT) guards via `BaseController`; opt out per route |
| Security | `errors-and-filters` | Throw `HttpException`/`BaseException`; one `CustomExceptionFilter`; never name internal services |
| Security | `rate-limiting-at-edge` | Rate limiting lives at the edge gateway — never an in-app guard or decorator |
| Config | `config-env-zod` | Zod-validate env at boot; read it only through a typed `EnvService`, never `process.env` |
| Reliability | `spot-idempotency-outbox` | Mutating endpoints are idempotent; emit events via the same-TX outbox; drain on `SIGTERM` |
| Reliability | `events-redis-streams` | Async events flow through the outbox → a stream; envelopes are unversioned + additive-only |
| Observability | `logging-cls` | One CLS-aware logger prefixing `requestId`; mask sensitive fields |
| Reliability | `workers` | Workers bootstrap a controller-less `WorkerModule` via `main-worker.ts`, deploy separately |
| Testing | `testing` | Unit-test services; integration-test controllers against a real test DB; `*.spec.ts` |

## This skill supersedes the generic `nestjs-best-practices` skill

If the community `nestjs-best-practices` skill is also installed, **these rules win** wherever they
conflict — they encode hard-won, sometimes counter-intuitive decisions. Do not "correct" our code
back toward the generic advice:

| Generic advice | Our rule (and why) |
|---|---|
| Add in-app rate limiting (`@Throttle`, a `RateLimitGuard`) | `rate-limiting-at-edge` — the edge gateway owns it; the API trusts pre-filtered traffic |
| Register a global `ValidationPipe` / use `@nestjs/pipes` for validation | `validation-baseservice` — `BaseService.execute` validates at the domain boundary |
| Serialize/validate responses (`ClassSerializerInterceptor`, output DTO validation) | `outputs-not-validated` — outputs come from trusted internal code; validating them is wasted cost |
| Prefer interfaces + injection tokens for contracts | `runtime-emitted-constructs` — the domain model must exist at runtime; use `class`/`abstract class`/`enum` |
| Emit domain events with a generic `EventEmitter` | `spot-idempotency-outbox` — never publish from a use case; insert an outbox row in the same TX |
| One auth guard | `auth-layered-guards` — a perimeter (edge-key) guard AND an identity (JWT) guard, layered |

## Scaffolding

When the task is to **generate** code (not just review it), route to the matching scaffolding skill —
each gives the exact file tree to emit and pulls shapes from this skill's `templates/`:

| You want to… | Use skill |
|---|---|
| Bootstrap a brand-new NestJS API (the `@core/` + `shared/` foundation) | `scaffold-nestjs-api` |
| Add a feature module (controller + DTOs + `Api<Route>Doc` + wiring) | `add-nestjs-module` |
| Add a domain use case (`index.service` + `input` + `output` + module) | `add-nestjs-use-case` |
| Add a repository / gateway / factory operation | `add-nestjs-shared-op` |
| Add a TypeORM migration | `add-nestjs-migration` |

## Templates

Complete, copy-paste-ready files live under `templates/`. Replace the `<Placeholder>` tokens.
They are the literal source-of-truth shapes the rules describe.

- `templates/core/` — the spine and infra: `base-class.ts`, `base-service.ts`, `base-controller.ts`,
  `env.schema.ts`, `env.service.ts`, `api-key.guard.ts`, `jwt.guard.ts`, `custom-exception.filter.ts`,
  `base.exception.ts`, `logging.interceptor.ts`, `idempotency-key.interceptor.ts`, `custom-logger.ts`
- `templates/feature/` — `controller.ts`, `feature.module.ts`, `dtos/route.dto.ts` (the `Api<Route>Doc` helper), `dtos/request.dto.ts`
- `templates/use-case/` — `index.service.ts`, `input.ts`, `output.ts`, `use-case.module.ts`
- `templates/shared-op/` — `repository/`, `gateway/`, `factory/` (each: `index.<role>.ts`, `input.ts`, `output.ts`, `operation.module.ts`)
- `templates/db/` — `entity.ts`, `migration.ts`
- `templates/worker/` — `worker.module.ts`, `main-worker.ts`, `outbox-drainer.worker.ts`, `insert-outbox-event.repository.ts`

## How to apply this skill

1. **Identify the layer** you're touching (domain / application / infrastructure) using the map above.
2. **Read the matching rule file(s)** in `rules/` — they carry the *why*, the WRONG/RIGHT examples, and the edge cases. Don't apply a rule from the one-line summary alone.
3. **Copy the matching template** from `templates/` and fill in the placeholders, rather than writing boilerplate from memory.
4. When generating more than a single file, **hand off to the scaffolding skill** for that shape so the whole file tree and wiring come out consistent.
5. If a project's own `CONVENTIONS.md` / `AGENTS.md` contradicts a rule here, **the project file wins** — these are defaults, not law. Note the divergence and follow the project.
