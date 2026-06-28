---
name: add-nestjs-shared-op
description: >-
  Add a shared-layer operation to a NestJS API in the per-operation directory pattern — a repository
  operation (persistence), a gateway operation (the anti-corruption layer to an external system like
  an IdP, mailer, or object storage), or a factory operation (a pure domain helper such as hashing or
  code generation). Use this skill WHENEVER the user wants to add a repository, query, gateway,
  external-API client, HTTP client, or factory to a Nest API — e.g. "add a repository op to upsert a
  user", "wrap the email provider in a gateway", "add a factory that generates and hashes an OTP".
  Each operation is its own directory with a single execute() method.
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# Add a shared-layer operation (repository / gateway / factory)

Repositories, gateways, and factories all follow the SAME per-operation shape: one directory per
operation, one `execute(input)` method, a 3-level module chain (operation → group → feature), and
**no `@Global`, no top-level aggregator**. Read
`../nestjs-api-architect/rules/arch-per-operation-layers.md` and `inputs-input-of.md`. Emit from
`../nestjs-api-architect/templates/shared-op/{repository,gateway,factory}/`.

Pick the role:

- **repository** — persistence. The only code that touches a TypeORM repository. Threads `txEntityManager` when present so it can run inside a caller's transaction.
- **gateway** — the **anti-corruption layer**: the only code that speaks an external system's protocol (the IdP, a mailer, object storage, a CDN). It maps the upstream's response into a clean `Output` so the upstream's shape never leaks into the domain.
- **factory** — a pure domain operation with no I/O (generate a code, hash a secret, build a value object).

## Target structure

```
src/shared/<group>-<role>/                # e.g. user-repository, keycloak-gateway, otp-factory
├── <operation>/                          # e.g. upsert-user, password-grant, generate-otp
│   ├── index.<role>.ts                   # @Injectable() class, single execute(input)
│   ├── input.ts                          # XInput extends BaseClass (class-validator; txEntityManager? for repos)
│   ├── output.ts                         # XOutput extends BaseClass (not validated)
│   ├── <operation>.module.ts             # provides + exports the class (+ TypeOrmModule.forFeature / HttpModule)
│   └── index.ts                          # barrel export
└── <group>-<role>.module.ts              # group module re-exporting each per-operation module
```

## Steps

1. **One operation, one directory.** Don't add a second method to an existing op class — add a sibling operation directory.
2. **`execute(input)` only** — mirror the `BaseService` shape. The op class is the single thing that touches the underlying library (TypeORM repo / HTTP client / crypto).
3. **Input / Output** extend `BaseClass`. Repository/gateway/factory inputs are validated when called via `XInput.of({...})`; outputs are not validated (`outputs-not-validated`).
4. **Repositories** accept `txEntityManager?: EntityManager` on the input and run against it when present, otherwise the injected repository (`services-and-transactions`).
5. **Gateways** never leak the upstream's response shape upward, and their thrown errors carry generic messages — never name the upstream service (`errors-and-filters`).
6. **Module chain** — the operation module provides+exports the class; the group module re-exports every operation module; the feature module imports the group module directly. No `@Global`, no aggregator (`arch-per-operation-layers`).
7. **Callers** always wrap input in `XInput.of({...})` — never `{...} as never` (`inputs-input-of`).
