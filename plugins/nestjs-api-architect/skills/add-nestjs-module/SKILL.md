---
name: add-nestjs-module
description: >-
  Add a feature module (a DDD bounded context) to an existing NestJS API — controller in the
  application layer, HTTP DTOs, the Api<Route>Doc Swagger helper, route prefix matching the module,
  and the module wiring that imports its use-case and shared group modules. Use this skill WHENEVER
  the user wants to add a new feature, module, controller, resource, or bounded context to a Nest
  API — e.g. "add a comments module", "create a controller for orders", "expose endpoints for
  payments". For the business logic inside it use add-nestjs-use-case; for a whole new API use
  scaffold-nestjs-api.
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# Add a feature module (bounded context)

A feature module is a bounded context: it owns a `v1/<feature>` route prefix and a set of use cases.
Read `../nestjs-api-architect/rules/arch-route-prefixes.md`, `controllers-thin.md`, and
`swagger-doc-helpers.md` first. Emit from `../nestjs-api-architect/templates/feature/`.

## Target structure

```
src/modules/<feature>/
├── <feature>.module.ts          # registers the controller; imports use-case + shared group modules
├── application/
│   ├── <feature>.controller.ts  # @Controller("v1/<feature>") extends BaseController; thin methods
│   └── dtos/
│       ├── <request>.dto.ts      # HTTP request bodies (class-validator + @ApiProperty)
│       └── <route-name>.dto.ts   # the Api<Route>Doc() Swagger helper (one per route)
└── domain/                       # use cases live here — add them with add-nestjs-use-case
```

## Steps

1. **Pick the prefix** — `v1/<owning-module>`, plural lower-kebab. It locks when the first controller lands; a route NEVER lives under another module's prefix (`arch-route-prefixes`).
2. **Controller** — extends `BaseController` (inherits the layered guards). Each method is route + pull request data + one call: `return this.<useCase>.execute(<UseCase>Input.of({...}));`. No mapping, no casts, no branching (`controllers-thin`).
3. **Runtime decorators on the method** — `@HttpCode(HttpStatus.X)`, `@Idempotent({ ttlSeconds })` on mutations, `@SkipApiKey()`/`@PublicRoute()` if the route opts out. These stay visible on the method, never inside the doc helper.
4. **Doc helper** — one `Api<Route>Doc()` per route in `dtos/<route-name>.dto.ts`, composed with `applyDecorators(...)`, Swagger-only (`swagger-doc-helpers`). Typed shorthand responses infer status — don't pass `status:`.
5. **Request DTOs** — wire-format bodies in `dtos/`; the controller maps them into `<UseCase>Input.of({ ...body, userId: user.id })`.
6. **Return types** — the controller returns the use case's `Output` directly; don't invent a `ResponseDto` that just mirrors it.
7. **Void endpoints** — `Promise<void>` + `@HttpCode(204)` + `@ApiNoContentResponse`, no `return {}` (`void-endpoints-204`).
8. **Wire the module** — import the per-use-case modules and shared group modules this feature needs, directly. No `@Global`, no aggregator. Register the module in `app.module.ts`.
9. **Mutating endpoints** are idempotent and (if they emit events) go through the outbox — see `spot-idempotency-outbox`.
