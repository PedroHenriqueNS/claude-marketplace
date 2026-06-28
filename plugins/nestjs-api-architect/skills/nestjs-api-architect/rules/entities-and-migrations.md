# Migrations own all DDL; entities are metadata only

> **DDD lens:** entities are persistence-mapped aggregates. The schema is owned by an explicit,
> reviewable migration history — never silently inferred from the model.

Every `@Entity({...})` carries `synchronize: false`, and every `@ManyToOne` / `@OneToMany` /
`@OneToOne` relation carries `createForeignKeyConstraints: false`. Migrations own all DDL — the entity
decorators are application-side metadata only. There is **no** `schema:` field on the entity; a global
`DB_SCHEMA` (via the `DataSource`) provides it so per-environment schema swaps stay possible.

```typescript
// WRONG — schema generation on, FK constraints auto-created, schema hard-coded
@Entity({ name: "follows", schema: "app" })
export class FollowEntity {
  @ManyToOne(() => UserEntity)
  follower!: UserEntity;
}
```

```typescript
// RIGHT — migrations own DDL; decorators document intent only
@Entity({ name: "follows", synchronize: false })
export class FollowEntity {
  @ManyToOne(() => UserEntity, { createForeignKeyConstraints: false, onDelete: "CASCADE" })
  follower!: UserEntity;
}
```

Declare `@Index(...)` and column `default:` on the entity for documentation even though they don't
drive generation while `synchronize: false` — they keep the model readable and matched to the
migration. Enums used by entities live in `src/shared/constants/<name>.enum.ts`; the entity imports but
does not re-export them.

**The smell test:** if `migration:generate` emits a noisy migration that drops every named FK
(`*_fkey`), every named partial unique index (`*_active`), or column `DEFAULT` clauses *en masse*, you
forgot one of the two flags. Delete the generated file, fix the entity, re-run — a correct setup reports
"No changes in database schema were found".

## Denormalized counters: `<entity>_insights`

Counter fields (`followers_count`, `following_count`, future `post_insights`, …) live in a dedicated
`<entity>_insights` table, never on the parent entity's row:

- one row per parent, FK with `ON DELETE CASCADE`;
- `BIGINT` counters with `CHECK (col >= 0)`;
- updated transactionally with the operation that changes them;
- read via `LEFT JOIN` from the parent with `COALESCE(col, 0)` (cheap defence against a missing row).

Avoid `<entity>_stats` / `<entity>_counters` — `<entity>_insights` is the established name.

**Supersedes `db-use-migrations`** (generic nestjs-best-practices): it's not enough to "use migrations" —
schema generation is disabled per-entity and per-relation so a stray decorator can never drift the DDL.
