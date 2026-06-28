# Features

A "feature" in this repo is a **plugin**. Each ships a marketplace catalog entry plus one or more skills. All seven are currently shipped at `0.1.0`. The marketplace itself (the catalog that makes them installable) is the eighth, cross-cutting feature.

## The marketplace catalog

- **Purpose:** make every plugin in this repo installable by name from one manifest.
- **Behavior:** `/plugin marketplace add <path-or-owner/repo>` then `/plugin install <name>@pedrohenriquens`. See [ARCHITECTURE.md](./ARCHITECTURE.md#install-time-resolution).
- **Implementation:** `.claude-plugin/marketplace.json`; each `source` is a relative path into `plugins/`.
- **Status:** shipped (local install). Remote install pending push — see [ROADMAP.md](./ROADMAP.md).

## Best-practices compliance gate

- **Purpose:** enforce the rule that every skill follows Claude Code best practices (`docs/CONVENTIONS.md`) — audit the existing plugins to a clean baseline, then gate every change so nothing merges below the bar.
- **Behavior:** CI (GitHub Actions) runs `claude plugin validate` per plugin, a `plugin.json`↔`marketplace.json` version-sync check, and a mechanical `SKILL.md` lint as the hard gate; `skill-auditor` provides the deeper judgment-based audit. Verification seam is per-plugin.
- **Implementation:** specced in [docs/prds/best-practices-compliance-gate.md](./prds/best-practices-compliance-gate.md). `scripts/check_compliance.py` + `.github/workflows/validate.yml`; supersedes the `docs/PRD.md` "no CI yet" non-goal for validation.
- **Status:** in-progress. Mechanical gate shipped and green across all 6 plugins (0 failures); CI workflow in place (activates once the repo has a remote — Phase 1). Remaining: the deep per-skill `skill-auditor` audit of the 46 skills.

## project-initializer

- **Purpose:** scaffold a project's living agent documentation — `AGENTS.md`, `CLAUDE.md`, and `docs/*` — with documentation-maintenance conventions baked in.
- **Behavior:** triggered by explicit phrases ("init this project", "scaffold docs for agents"). Surveys the repo, detects stack and event-broker usage, then creates only the docs that don't already exist (skip-and-report). Includes a diagramming policy (Mermaid only, earns-its-place).
- **Implementation:** `plugins/project-initializer/skills/project-initializer/SKILL.md` + `templates/generate-events-catalog.md`.
- **Status:** shipped. (This very docs set was produced by it.)

## to-prd

- **Purpose:** turn the current conversation into a feature-level PRD and publish it.
- **Behavior:** distills the chat into a PRD and publishes to the issue tracker, falling back to `docs/prds/`. Reads project-initializer living docs for context.
- **Implementation:** `plugins/to-prd/skills/to-prd/SKILL.md`.
- **Status:** shipped.

## azure-devops-card

- **Purpose:** draft Azure DevOps work-item titles and markdown descriptions in Brazilian Portuguese.
- **Behavior:** produces titles in the `[categoria][FRONTEND|BACKEND]` pattern with matching descriptions (pt-BR).
- **Implementation:** `plugins/azure-devops-card/skills/azure-devops-card/SKILL.md`.
- **Status:** shipped.

## skill-auditor

- **Purpose:** audit and improve Claude skills against Claude Code best practices.
- **Behavior:** checks frontmatter, triggering quality, leanness, and progressive disclosure; recommends fixes.
- **Implementation:** `plugins/skill-auditor/skills/skill-auditor/SKILL.md`.
- **Status:** shipped.

## tsconfig-upgrade

- **Purpose:** safely upgrade `tsconfig.json`.
- **Behavior:** pre-flights breaking changes, preserves paths/aliases, and handles cascading TS errors (e.g. TS2729, TS5090).
- **Implementation:** `plugins/tsconfig-upgrade/skills/tsconfig-upgrade/SKILL.md` + `evals/evals.json`.
- **Status:** shipped.

## nestjs-api-architect

- **Purpose:** build, maintain, and scaffold NestJS APIs as a Domain-Driven Design (DDD) layered system — generalizing the production `gigabase-api-core` conventions into reusable, project-neutral patterns. Supersedes the generic community `nestjs-best-practices` skill where they conflict.
- **Behavior:** a main reference skill (auto-triggers on NestJS/DDD work) carrying a layer map, quick-ref rules table, supersede table, plus 24 on-demand rule files and 48 `.ts` templates (including Kubernetes liveness/readiness health probes with a graceful-drain flag and `kube-probe` log silencing); and five scaffolding skills — bootstrap an API foundation, add a feature module, a use-case service, a shared repository/gateway operation, or a TypeORM migration.
- **Implementation:** `plugins/nestjs-api-architect/skills/nestjs-api-architect/SKILL.md` (+ `rules/`, `templates/`) and `scaffold-nestjs-api`, `add-nestjs-module`, `add-nestjs-use-case`, `add-nestjs-shared-op`, `add-nestjs-migration`.
- **Status:** shipped.

## marketing-skills

- **Purpose:** a bundle of 41 cross-referencing marketing skills — SEO, AI search (AEO/GEO), CRO, analytics, schema, copywriting, ads, email, social, PR, pricing, and more.
- **Behavior:** each skill is independently triggerable and links to siblings; many carry `references/` deep-dive docs.
- **Implementation:** `plugins/marketing-skills/skills/<skill>/SKILL.md`. **Derived** from a third-party repo — see [../NOTICE](../NOTICE) and review the upstream license before public distribution.
- **Status:** shipped.
