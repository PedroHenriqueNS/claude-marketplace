# Validate env with Zod at boot; read it only through `EnvService`

The whole environment is validated once, at startup, against a Zod schema. The app fails fast on a
missing or malformed variable rather than crashing deep in a request three hours later. Every read goes
through a typed `EnvService` (typed getters over `ConfigService<Env, true>`); `process.env` is never
touched outside that one service.

```typescript
// WRONG — untyped, unvalidated, scattered process.env reads
const ttl = Number(process.env.OTP_TTL_SECONDS) || 600;
const url = process.env.DATABASE_URL!;
```

```typescript
// RIGHT — one validated schema, one typed accessor
// env.schema.ts
export const envSchema = z.object({
  NODE_ENV: z.enum(["local", "staging", "production"]),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  DB_SCHEMA: z.string().default("public"),
  OTP_TTL_SECONDS: z.coerce.number().default(600),
});
export type Env = z.infer<typeof envSchema>; // documented `type` exception — schema is the source of truth

// usage
const ttl = this.env.get("OTP_TTL_SECONDS"); // number, typed, already validated
```

`type Env = z.infer<typeof envSchema>` is the one place a `type` alias is correct (see
`runtime-emitted-constructs`) — it's derived from a runtime schema, so the schema, not the alias, is the
source of truth. Add a custom boolean preprocessor (e.g. `envBoolean`) so `"true"`/`"false"` strings
coerce cleanly; env vars are always strings.

The win: a typo in a variable name, a non-numeric `PORT`, or a missing `DATABASE_URL` halts the boot
with a precise message, and every consumer gets autocompleted, correctly-typed values.

**Supersedes `devops-use-config-module`** (generic nestjs-best-practices): the config module is
Zod-validated and fail-fast, and direct `process.env` access is banned everywhere but `EnvService`.
