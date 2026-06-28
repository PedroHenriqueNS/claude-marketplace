---
name: add-nestjs-use-case
description: >-
  Add a domain use case to a NestJS feature module — one BaseService<Input, Output> implementing
  perform(), plus its input.ts, output.ts, and per-use-case module, in the DDD domain layer. Use
  this skill WHENEVER the user wants to add business logic, a domain service, an application service,
  or a single operation to a Nest API — e.g. "add a use case to accept a follow request", "implement
  the create-order logic", "add a service that confirms an email change". This is the domain-layer
  counterpart to add-nestjs-module (which adds the controller that calls it).
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# Add a domain use case

One use case = one folder = one `BaseService`. It captures *what the business does* with no knowledge
of HTTP. Read `../nestjs-api-architect/rules/services-and-transactions.md`, `inputs-input-of.md`,
`validation-baseservice.md`, and `outputs-not-validated.md`. Emit from
`../nestjs-api-architect/templates/use-case/`.

## Target structure

```
src/modules/<feature>/domain/<use-case>/
├── index.service.ts             # @Injectable() <UseCase>Service extends BaseService<Input, Output>; perform()
├── input.ts                     # <UseCase>Input extends BaseClass (class-validator + @ApiProperty on body fields)
├── output.ts                    # <UseCase>Output extends BaseClass (wire-shape types; @ApiProperty; not validated)
└── <use-case>.module.ts         # provides + exports the service; imports the repo/gateway group modules it needs
```

## Steps

1. **Service** — `extends BaseService<<UseCase>Input, <UseCase>Output>`, implement `perform()`. `execute()` (on the base) validates the input for you; never call validation yourself (`validation-baseservice`).
2. **Input** — `extends BaseClass`, class-validator decorators on every field. Body-sourced fields carry `@ApiProperty`; auth/path/query-injected fields and `txEntityManager?` do NOT, and get the documented one-line comment (`api-property-on-io`).
3. **Output** — `extends BaseClass`, **wire-shape types** (`createdAt: string`, not `Date`). The service does any `Date.toISOString()` / field mapping inside `perform()` so the controller stays thin (`controllers-thin`). Outputs are not validated at runtime (`outputs-not-validated`).
4. **Call dependencies correctly** — every repo / gateway / factory / service call wraps its argument in `XInput.of({...})`; the `{...} as never` shortcut is forbidden (`inputs-input-of`).
5. **Transactions** — multi-row or cross-system work uses `DataSource.transaction(async m => …)`, threading `txEntityManager: m` into each op's input (`services-and-transactions`).
6. **Events** — if this use case emits a domain event, insert the outbox row inside the SAME transaction via `InsertOutboxEventRepository`; never publish to the stream from here (`spot-idempotency-outbox`, `events-redis-streams`).
7. **Module** — provide + export the service; import the shared group modules it depends on. Register the use-case module in the feature module's `imports`.
8. **Test** — a `*.spec.ts` unit test for the service (happy path + each error path), mocking its repos/gateways (`testing`).
