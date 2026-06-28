# DDD layers: domain, application, infrastructure

> **DDD lens:** this *is* the lens — every other rule is a detail of keeping these three layers honest.

A NestJS API is organized as a Domain-Driven Design layered system. Each feature is a **bounded
context** — a Nest module under `src/modules/<feature>/` that owns its `v1/<feature>` route prefix and
its slice of the domain. Inside and around it, code falls into three layers, and dependencies only
ever point inward: the application layer depends on the domain, infrastructure implements what the
domain needs, and the domain depends on neither.

```
src/
├── @core/                       # INFRASTRUCTURE (framework): config, db, decorators, entities,
│                                #   exceptions, filters, guards, interceptors, loggers, redis, workers
├── shared/                      # INFRASTRUCTURE (domain support) + the spine
│   ├── base/                    #   BaseClass, BaseService, BaseController
│   ├── repositories/            #   persistence abstraction (per-operation dirs)
│   ├── gateways/                #   anti-corruption layer to external systems
│   ├── factories/               #   pure domain factories (hashing, code generation, ...)
│   ├── api-docs/                #   cross-cutting Api<Route>Doc helpers
│   └── constants/               #   enums — the ubiquitous language
└── modules/<feature>/           # one BOUNDED CONTEXT per feature
    ├── application/             #   APPLICATION LAYER: controller (delivery) + HTTP DTOs + dtos/<route>.dto
    └── domain/<use-case>/       #   DOMAIN LAYER: one use case = BaseService + input + output + module
```

| DDD concept | Where it lives |
|---|---|
| Bounded context | a feature module (`modules/<feature>/`) |
| Domain layer | `domain/<use-case>/` — use cases as domain services (`BaseService<Input, Output>`) |
| Aggregate / entity | a TypeORM entity in `@core/entities/`; denormalized counters in `<entity>_insights` tables |
| Value object at the boundary | `Input` / `Output` (`extends BaseClass`), built only via `XInput.of({...})` |
| Application layer | `application/` — the controller is a thin delivery mechanism |
| Infrastructure | `@core/` (framework) + `shared/repositories` (persistence) |
| Anti-corruption layer | `shared/gateways/` — the only code that speaks an external system's protocol |
| Domain events | the transactional outbox |
| Ubiquitous language | enums in `shared/constants/` |

Why split this way: the domain layer captures *what the business does* (follow a user, confirm an
email) with no knowledge of HTTP, SQL, or any vendor. The application layer translates an HTTP request
into a use-case call and hands the result back. Infrastructure is replaceable plumbing. When the
identity provider changes, only a gateway changes; when the wire format changes, only the application
layer changes; the domain stays put. That isolation is what keeps a growing API understandable.

**Wiring.** A feature module imports its per-use-case modules and the shared group modules it needs
**directly** — there is no top-level "all use cases" aggregator and no `@Global` on the shared layers.
Explicit imports keep each bounded context's real dependencies visible (see
`arch-per-operation-layers`).

```typescript
// modules/<feature>/<feature>.module.ts — a bounded context wires only what it uses
@Module({
  imports: [<UseCase>Module, <Entity>RepositoryModule, <External>GatewayModule],
  controllers: [<Feature>Controller],
})
export class <Feature>Module {}
```
