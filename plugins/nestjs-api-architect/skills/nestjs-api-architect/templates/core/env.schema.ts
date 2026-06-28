// env.schema.ts — the environment is validated ONCE at boot. The app fails fast on a missing or
// malformed variable instead of crashing deep in a request. Add your variables to `envSchema`.
import { z } from "zod";

/** Coerces "true"/"false"/"1"/"0" strings into a real boolean. */
const envBoolean = z
  .preprocess((v) => {
    if (typeof v === "boolean") return v;
    if (v === "true" || v === "1") return true;
    if (v === "false" || v === "0") return false;
    return v;
  }, z.boolean());

export const envSchema = z.object({
  NODE_ENV: z.enum(["local", "test", "staging", "production"]).default("local"),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url(),
  DB_SCHEMA: z.string().min(1), // provided globally to the DataSource — never hard-coded on entities

  API_KEY: z.string().min(1),
  MIGRATIONS_RUN: envBoolean.default(false),

  // Add more variables here. Keep secrets out of source — they arrive from the environment.
});

/**
 * The one place a `type` alias is the right tool: it is DERIVED from the Zod schema (the runtime
 * source of truth), so it carries no independent runtime obligation. See the
 * `runtime-emitted-constructs` rule for why this is the documented exception.
 */
export type Env = z.infer<typeof envSchema>;

/** Parse + validate. Call once during bootstrap; throw a readable error on failure. */
export function parseEnv(raw: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment:\n${issues}`);
  }
  return result.data;
}
