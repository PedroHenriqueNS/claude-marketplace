# Rules index

One file per rule. Read the file before applying or reviewing — each carries the *why*, a WRONG
example, a RIGHT example, and the edge cases. The one-liners below are only a map.

A rule marked **⊃ `community-rule`** intentionally supersedes that rule from the generic
`nestjs-best-practices` skill.

## Architecture

- **`arch-ddd-layers`** — The domain / application / infrastructure split, dependencies pointing inward, and how each DDD concept maps onto the folder layout.
- **`arch-per-operation-layers`** — Repositories, gateways, and factories are each a per-operation directory with a 3-level module chain (operation → group → feature). No `@Global`, no top-level aggregator. ⊃ `arch-use-repository-pattern`
- **`arch-route-prefixes`** — Each controller carries `@Controller("v1/<owning-module>")`; a module never serves routes under another module's prefix. Path-segment naming conventions.

## Application layer (HTTP delivery)

- **`controllers-thin`** — A controller method does exactly three things: map the route, pull request data, call the use case and return its output. No mapping, no `as unknown as`, no branching. ⊃ `api-use-dto-serialization`
- **`swagger-doc-helpers`** — Every route's Swagger contract lives in one `Api<Route>Doc()` composed with `applyDecorators(...)`. Swagger-only inside; runtime decorators (`@HttpCode`, `@UseGuards`) stay visible on the method.
- **`api-property-on-io`** — Every body-sourced field on an `Input`/`Output` carries `@ApiProperty`/`@ApiPropertyOptional`. Auth/path/query-injected and `txEntityManager` fields are the documented exceptions.
- **`http-status-enum`** — Use `HttpStatus.<NAME>` everywhere; numeric status literals are banned in source.
- **`void-endpoints-204`** — No-body endpoints are `Promise<void>` + `@HttpCode(204)` + `@ApiNoContentResponse`, never `return {}`.

## Domain model

- **`runtime-emitted-constructs`** — Prefer `enum` / `class` / `abstract class` over `type` / `interface`, because the latter are erased at compile time and unreachable by decorator metadata or `instanceof`. Enum members are `UPPER_SNAKE_CASE`. Two documented exceptions. ⊃ `di-use-interfaces-tokens`, `di-interface-segregation`
- **`inputs-input-of`** — Every call to a repository / gateway / factory / service `execute()` wraps its argument in `XInput.of({...})`. The `{...} as never` shortcut is forbidden. ⊃ `security-validate-all-input`
- **`validation-baseservice`** — Validation runs at the input boundary inside `BaseService.execute` via `BaseClass.of(input, true)`. Never register a global `ValidationPipe`. ⊃ `api-use-pipes`
- **`outputs-not-validated`** — Outputs are produced by trusted internal code and are **not** validated at runtime. `Output` extends `BaseClass` only for typed `.of({...})` construction. ⊃ `security-sanitize-output`
- **`services-and-transactions`** — One use case = one `BaseService<Input, Output>` implementing `perform()`. Cross-row/cross-system work uses a `DataSource` transaction with `txEntityManager` threaded through the input.

## Persistence

- **`entities-and-migrations`** — Every `@Entity` is `synchronize:false`; every relation is `createForeignKeyConstraints:false`; no `schema:` on the entity (a global `DB_SCHEMA` provides it). Migrations own all DDL. The `<entity>_insights` counter-table pattern. ⊃ `db-use-migrations`

## Security

- **`auth-layered-guards`** — Two layered guards run by default via `BaseController`: a perimeter guard (edge API key) and an identity guard (JWT). Opt out per route with `@SkipApiKey()` / `@PublicRoute()`. Never `@UseGuards()` inside a feature module. ⊃ `security-auth-jwt`, `security-use-guards`
- **`errors-and-filters`** — Throw `HttpException` subclasses or a `BaseException`; one `CustomExceptionFilter` normalizes everything. Error-envelope messages never name an internal service. ⊃ `error-use-exception-filters`
- **`rate-limiting-at-edge`** — Rate limiting is enforced at the edge gateway. Never add an in-app `@RateLimit`/`RateLimitGuard`. ⊃ `security-rate-limiting`

## Config

- **`config-env-zod`** — Validate the environment with Zod at startup (fail fast); read it only through a typed `EnvService`. Never touch `process.env` outside that service. ⊃ `devops-use-config-module`

## Reliability & events

- **`spot-idempotency-outbox`** — On a platform where pods can die any moment: every mutating endpoint is idempotent, every async event is written to the outbox in the same TX as the state change, and modules holding long-lived resources drain on `OnModuleDestroy`. ⊃ `arch-use-events`, `perf-async-hooks`
- **`events-redis-streams`** — A drainer worker publishes outbox rows to a single stream. Event envelopes are unversioned and additive-only; a breaking change mints a new event type. ⊃ `micro-use-queues`
- **`workers`** — Async workers bootstrap a controller-less `WorkerModule` from `main-worker.ts`, selected by `WORKER_NAME`, and run as separate deployments off the request path.

## Observability

- **`logging-cls`** — One CLS-aware logger prefixes every line with the request id; sensitive DTO fields are masked. ⊃ `devops-use-logging`

## Testing

- **`testing`** — Unit-test services in isolation; integration-test controllers against a real test database, not mocks; tests are `*.spec.ts`. ⊃ `test-use-testing-module`, `test-e2e-supertest`
