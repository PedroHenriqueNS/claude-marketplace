# nestjs-api-architect

A Claude Code plugin that teaches Claude to build, maintain, and scaffold **NestJS APIs as a
Domain-Driven Design (DDD) layered system** — and keeps it from drifting back to generic Nest
boilerplate.

It encodes a real production architecture: a clean domain / application / infrastructure split,
use-case services on a shared `BaseService`, per-operation repositories and gateways (the
anti-corruption layer), `XInput.of()` validation discipline, `Api<Route>Doc` Swagger helpers,
`HttpStatus` enums, runtime-emitted constructs over `type`/`interface`, a transactional outbox for
domain events, and spot-safe idempotency. The patterns are generalized so they apply to any NestJS
project; a real reference codebase ("gigabase") supplies the worked examples.

## What's inside

| Skill | Purpose |
|---|---|
| **`nestjs-api-architect`** | The rulebook + template library. Auto-triggers on any NestJS work and tells Claude how the architecture fits together. |
| **`scaffold-nestjs-api`** | Bootstrap a brand-new API: the `@core/` + `shared/` foundation, base classes, config, guards, filters, health, Swagger. |
| **`add-nestjs-module`** | Add a feature module / bounded context: controller + HTTP DTOs + `Api<Route>Doc` helper + wiring. |
| **`add-nestjs-use-case`** | Add a domain use case: `index.service.ts` + `input.ts` + `output.ts` + module. |
| **`add-nestjs-shared-op`** | Add a repository / gateway / factory operation in the per-operation layout. |
| **`add-nestjs-migration`** | Add an idempotent TypeORM migration. |

The main skill ships ~23 focused rule files (read on demand) and ~30 copy-paste templates covering
every layer.

## Relationship to the community `nestjs-best-practices` skill

This plugin deliberately **supersedes** the generic community skill wherever they disagree — in-app
rate limiting, global `ValidationPipe`, output serialization, interface-first contracts, and generic
event emitters are all replaced with the conventions this architecture actually uses. The `SKILL.md`
carries the full conflict table.

## Install

Add the marketplace and install:

```
/plugin marketplace add PedroHenriqueNS/claude-marketplace
/plugin install nestjs-api-architect@pedrohenriquens
```

## License

MIT. Conventions distilled from the gigabase API; community-skill structure adapted under MIT (see the
original `nestjs-best-practices` by Kadajett).
