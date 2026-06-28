---
name: add-nestjs-migration
description: >-
  Add a TypeORM migration to a NestJS API — an idempotent, schema-qualified, raw-SQL migration with a
  symmetric up()/down(), kept in sync with an entity that carries synchronize:false and
  createForeignKeyConstraints:false. Use this skill WHENEVER the user wants a database schema change
  in a Nest/TypeORM API — a new table, column, index, enum, constraint, or a data backfill — e.g.
  "add a migration for the blocks table", "add a nullable bio column to users", "create the outbox
  table", "add a partial unique index". Covers the generate/run/revert CLI flow and why generated
  migrations sometimes go noisy.
license: MIT
metadata:
  author: PedroHenriqueNS
  version: "0.1.0"
---

# Add a TypeORM migration

Migrations own ALL DDL — entities are application-side metadata only. Read
`../nestjs-api-architect/rules/entities-and-migrations.md`. Emit from
`../nestjs-api-architect/templates/db/migration.ts` (and `entity.ts` if you're adding/altering an entity).

## Flow

1. **Change the entity first** (if there is one). Every `@Entity` is `synchronize:false`; every relation is `createForeignKeyConstraints:false`; no `schema:` field (a global `DB_SCHEMA` supplies it). Declare indexes/defaults on the entity for documentation even though they don't drive generation.
2. **Generate or hand-write** the migration into `src/@core/db/migrations/`:
   ```bash
   # generate from entity diff (standalone data-source.ts; needs tsconfig-paths for the @/ alias)
   yarn typeorm migration:generate src/@core/db/migrations/<Name>
   # or hand-write for raw SQL the differ can't express (partial indexes, extensions, backfills)
   ```
3. **Make `up()` idempotent and schema-qualified** — `CREATE TABLE IF NOT EXISTS "${schema}"."<table>"`, `CREATE INDEX IF NOT EXISTS …`, `CREATE EXTENSION IF NOT EXISTS …`. Resolve the schema from the `DB_SCHEMA` env (don't hard-code it).
4. **Write a symmetric `down()`** — drop exactly what `up()` created, reverse order. Test the round-trip: `migration:run` → `migration:revert` → `migration:run` all succeed cleanly.
5. **Apply / revert**:
   ```bash
   yarn typeorm migration:run
   yarn typeorm migration:revert
   ```
6. **If a generated migration is noisy** — dropping every `*_fkey`, every partial unique index, or column `DEFAULT`s en masse — you forgot `synchronize:false` or `createForeignKeyConstraints:false` on the entity. Delete the file, fix the entity, regenerate. A clean entity regenerates to "No changes in database schema were found" (`entities-and-migrations`).
7. **Counters** go in a dedicated `<entity>_insights` table (one row per parent, BIGINT + `CHECK (col >= 0)`, FK `ON DELETE CASCADE`), not as columns on the parent.
