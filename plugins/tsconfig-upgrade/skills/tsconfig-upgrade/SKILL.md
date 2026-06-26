---
name: tsconfig-upgrade
description: Use whenever the user wants to upgrade, modernize, refresh, or replace a tsconfig.json — including pasting a "modern" template and asking to apply it, bumping `target`/`module`/`moduleResolution`, enabling strict flags, removing `baseUrl`, or adopting nodenext. Pre-flights breaking changes, preserves project-specific paths/aliases, and handles cascading errors like TS2729 (class field initialization order) and TS5090 (non-relative path mappings after baseUrl removal). Use even if the user just says "update tsconfig" or pastes a config without explicitly naming the breaking parts — the whole point of the skill is to catch what they did not name.
---

# tsconfig-upgrade

Upgrading a tsconfig is deceptively dangerous. A "modern" template that looks like a one-line copy-paste can silently switch the module system, surface hundreds of latent type errors, change class field semantics, and break existing path aliases. This skill exists to make those changes visible *before* they ship.

## When this skill applies

Trigger on requests like:
- "Upgrade my tsconfig"
- "Apply this modern tsconfig" (with a template pasted)
- "Switch to nodenext / ESM"
- "Enable strict mode" / "Turn on strictNullChecks"
- "Bump target to ES2023"
- "Remove baseUrl"
- Any time the user pastes a tsconfig JSON and asks to use it

Also trigger when the user reports a TS error after a tsconfig change and you suspect the upgrade caused it — TS2729, TS5090, sudden flood of TS2531/TS2532, decorator metadata broken, import-extension errors.

## The workflow

Do not edit tsconfig.json directly on the first turn. Follow this order:

1. **Read everything that influences compilation.** That means `tsconfig.json` AND every file in the `extends` chain (`tsconfig.build.json`, `tsconfig.spec.json`, etc.). A change in the base file may break a derived file you didn't open.

2. **Diff the proposed config against current.** For each changed key, classify it as **safe**, **risky**, or **cascading** (see classification table below).

3. **Present the breaking changes as an explicit choice** via `AskUserQuestion` before applying anything. The user must pick which level of risk to take. Never silently apply a `module: nodenext` or `strictNullChecks: true` flip because "that's what the template says."

4. **Preserve project-specific config.** Templates are generic. The current tsconfig almost always has things the template doesn't:
   - `paths` (path aliases — critical, almost every import depends on them)
   - `resolveJsonModule`
   - Custom `lib`, `types`, `typeRoots`
   - Project-specific flags the user added deliberately
   Carry these over unless the user explicitly asks to drop them.

5. **Apply the chosen subset.**

6. **Run the post-apply audit** (see "Cascading errors" below).

7. **State what changed and what to expect next** — especially type errors the user will hit on next build.

## Classification table

| Key change | Class | Why |
|---|---|---|
| `target` bump (ES2020 → ES2023) | Safe | Modern Node supports it. Watch for `useDefineForClassFields` default flip at ES2022+. |
| `forceConsistentCasingInFileNames: true` | Safe | Catches real bugs; modern default. |
| `isolatedModules: true` | Safe | May error on `export { SomeType }` without `export type` — easy mechanical fix. |
| `resolvePackageJsonExports: true` | Safe | Modern default. |
| `esModuleInterop: true` | Safe | Almost always already on. |
| `module: commonjs → nodenext` | **Risky (massive)** | Forces ESM-style imports with `.js` extensions across the codebase. Must reconcile `package.json` `type` field. May break decorator metadata in NestJS / Angular projects. |
| `moduleResolution: nodenext` | **Risky (massive)** | Couples with the above; same cascade. |
| `strictNullChecks: true` (from false) | **Risky** | Surfaces latent `T \| null` issues — TypeORM `findOne`, optional columns, optional params. Can produce dozens to hundreds of errors. |
| Other strict flags (`strict: true`, `noImplicitAny: true`, `strictPropertyInitialization: true`) | **Risky** | Each surfaces its own class of latent errors. Discuss separately. |
| `baseUrl` removed | **Cascading** | All values in `paths` must become relative (`"./test/*"` not `"test/*"`) or build fails with TS5090. |
| `target: ES2022+` (without explicit `useDefineForClassFields`) | **Cascading** | Default flips to `true`, changing class field semantics. Breaks NestJS pattern `logger = new Logger(this.name)` with parameter properties (TS2729). |

## Presenting the choice

When risky changes are present, use `AskUserQuestion` with explicit categories. Example shape:

- **Safe upgrade only** — bump `target`, enable `forceConsistentCasingInFileNames`, `isolatedModules`, `resolvePackageJsonExports`. Build stays green.
- **Safe + strict null checks** — adds `strictNullChecks: true`. Will surface many type errors.
- **Full upgrade (verbatim)** — applies the provided template exactly, including `module: nodenext`. Requires import migration and may break decorator metadata.

Include a **preview** of the resulting tsconfig in each option so the user sees the actual shape of what they're picking. Always recommend the safest option that meets the user's apparent intent.

## Cascading errors and their fixes

These fire *after* the apply, often on `yarn build` or in the IDE. Know them by sight.

### TS5090: "Non-relative paths are not allowed when 'baseUrl' is not set"

**Cause:** `baseUrl` was removed (modern TS deprecation), but `paths` still has non-relative values.

**Fix:** Every value in `paths` must start with `./`:
```json
"paths": {
  "@/*": ["./src/*"],
  "src/*": ["./src/*"],
  "Tests/*": ["./test/*"]   // not ["test/*"]
}
```

### TS2729: "Property 'X' is used before its initialization"

**Cause:** With `target: ES2022+`, `useDefineForClassFields` defaults to `true` — native ECMAScript class field semantics, where field initializers run *before* constructor-body parameter property assignments. The common NestJS pattern breaks:

```ts
class Foo {
  protected readonly logger = new Logger(this.name);    // this.name is undefined here!
  constructor(private readonly name: string) {}
}
```

**Two fixes — pick based on the codebase:**

1. **Add `"useDefineForClassFields": false`** to tsconfig — restores legacy TS semantics (parameter properties assigned first, field initializers after). This is the right fix for NestJS / Angular projects that rely on `experimentalDecorators` + `emitDecoratorMetadata`, since they're already on legacy semantics.

2. **Move the assignment into the constructor body** — works on any TS settings:
   ```ts
   protected readonly logger: Logger;
   constructor(private readonly name: string) {
     this.logger = new Logger(this.name);
   }
   ```

Default to option 1 for NestJS-style projects (single config change vs N file edits).

### TS1205 / TS1444: re-export of a type without `export type`

**Cause:** `isolatedModules: true` was enabled.

**Fix:** Mechanical — change `export { SomeType }` to `export type { SomeType }`. Each error tells you exactly which symbol.

### Sudden flood of TS2531 / TS2532 / TS18047

**Cause:** `strictNullChecks` was turned on.

**Fix:** Real null-safety bugs that were hidden. Narrow with `if (x)` guards, use `!` only at well-understood boundaries, type optional fields explicitly as `T | null` / `T | undefined`. Or revert `strictNullChecks` to `false` and defer.

### Decorator metadata stops working after nodenext migration

**Cause:** `module: nodenext` with NestJS / TypeORM / class-validator changes how `reflect-metadata` is loaded. Symptoms: DI fails, validation decorators don't fire, "Cannot read properties of undefined (reading 'design:type')".

**Fix:** This is a deep migration. Verify `reflect-metadata` is imported at the entrypoint, ensure `package.json` `type` field matches the module setting, and confirm all `import 'reflect-metadata'` statements survive the import-extension migration. If symptoms persist, revert to `module: commonjs` — `nodenext` is not always achievable on NestJS 10.

## Project-specific conventions to respect

Always check the project's `CLAUDE.md` / `AGENTS.md` / `CONVENTIONS.md` files before suggesting a change. Some projects pin specific tsconfig flags as non-negotiable (e.g., `strictNullChecks: false` for legacy codebases that won't be retrofitted). Do not propose flipping a pinned flag without first acknowledging the convention.

If the project memory (`~/.claude/projects/<project>/memory/`) has a feedback entry about tsconfig preferences, honor it — that's a hard user constraint, not a suggestion.

## What "done" looks like

The skill is finished when:
- The chosen tsconfig changes are applied.
- No cascading errors are left unflagged (run the post-apply audit mentally: did the change touch `baseUrl`? `target`? `module`? Each has a cascade to check).
- Project-specific config (paths, resolveJsonModule, custom flags) is preserved.
- The user knows what to expect on the next build — including the type errors that strict-mode upgrades will surface.

State this explicitly in the closing message, e.g. "Applied X. Expect Y on next build. Z is unchanged."
