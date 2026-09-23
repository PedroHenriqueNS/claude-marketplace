# Features

A "feature" in this repo is a **plugin**. Each ships a marketplace catalog entry plus one or more skills. Eleven plugins ship 61 skills between them: six are at `0.1.0`, `marketing-skills` and `nestjs-api-architect` are at `0.1.1`, `linear-flow` is at `0.2.0`, `project-initializer` is at `0.2.1`, and `prompt-creator` is at `0.3.1`. The marketplace itself (the catalog that makes them installable) is the twelfth, cross-cutting feature.

## The marketplace catalog

- **Purpose:** make every plugin in this repo installable by name from one manifest.
- **Behavior:** `/plugin marketplace add <path-or-owner/repo>` then `/plugin install <name>@pedrohenriquens`. See [ARCHITECTURE.md](./ARCHITECTURE.md#install-time-resolution).
- **Implementation:** `.claude-plugin/marketplace.json`; each `source` is a relative path into `plugins/`.
- **Status:** shipped (local install). Remote install pending push — see [ROADMAP.md](./ROADMAP.md).

## Best-practices compliance gate

- **Purpose:** enforce the rule that every skill follows Claude Code best practices (`docs/CONVENTIONS.md`) — audit the existing plugins to a clean baseline, then gate every change so nothing merges below the bar.
- **Behavior:** CI (GitHub Actions) runs `claude plugin validate` per plugin, `plugin.json`↔`marketplace.json` version- and description-sync checks, and a mechanical `SKILL.md` lint (frontmatter, the Agent Skills `name`/`description` limits, dead links) as the hard gate; `skill-auditor` provides the deeper judgment-based audit. Verification seam is per-plugin.
- **Implementation:** specced in [docs/prds/best-practices-compliance-gate.md](./prds/best-practices-compliance-gate.md). `scripts/check_compliance.py` + `.github/workflows/validate.yml`; supersedes the `docs/PRD.md` "no CI yet" non-goal for validation.
- **Status:** in-progress. Mechanical gate shipped and green across all 11 plugins (0 failures); CI workflow in place (activates once the repo has a remote — Phase 1). Remaining: the deep per-skill `skill-auditor` audit of the 61 skills.

## project-initializer

- **Purpose:** own a project's living agent documentation across its life — scaffold it (`AGENTS.md`, `CLAUDE.md`, `docs/*`) with documentation-maintenance conventions baked in, then re-tune it when the target Claude model changes.
- **Behavior:** two skills.
  - `project-initializer` — triggered by explicit phrases ("init this project", "scaffold docs for agents"). Surveys the repo, detects stack and event-broker usage, then creates only the docs that don't already exist (skip-and-report). Includes a diagramming policy (Mermaid only, earns-its-place).
  - `update-for-model` — triggered by explicit re-tune intent ("update the docs for Opus 5", "tune AGENTS.md for Sonnet 5"). **Asks which Claude model to target — never infers it from the session's own model** — then fetches Anthropic's live docs for it (models overview → prompting-best-practices hub → that model's own `prompting-claude-<slug>` page → migration guide → Claude Code model-config), extracts only what differs for that model, surveys the existing living docs, and writes `docs/MODEL-NOTES.md`. In-place edits to `AGENTS.md`/`CLAUDE.md`/`docs/*` are **proposed for approval first** and always link to `MODEL-NOTES.md` rather than inlining detail. Re-invoking for a different model rewrites the file wholesale and reports the delta. Anthropic Claude models only. Same live-fetch contract as `prompt-creator`: fetch every invocation, bundled date-stamped fallback, staleness warning when the fetch fails.
- **Implementation:** `plugins/project-initializer/skills/project-initializer/SKILL.md` + `templates/generate-events-catalog.md`; `plugins/project-initializer/skills/update-for-model/SKILL.md` + `references/model-tuning-sources.md` (offline fallback: URL map + extraction checklist, deliberately a method rather than a per-model snapshot) + `templates/model-notes.md` + `evals/evals.json` (6 evals incl. two negative triggers).
- **Status:** shipped at `0.2.1`, which points `update-for-model` at `platform.claude.com` instead of the `docs.claude.com` URLs that now redirect. (This very docs set was produced by `project-initializer`.)

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
- **Behavior:** a main reference skill (auto-triggers on NestJS/DDD work) carrying a layer map, quick-ref rules table, supersede table, plus 25 on-demand rule files and 52 `.ts` templates (including Kubernetes liveness/readiness health probes and a standardized Prometheus `/metrics` endpoint with HTTP RED metrics); and five scaffolding skills — bootstrap an API foundation, add a feature module, a use-case service, a shared repository/gateway operation, or a TypeORM migration.
- **Implementation:** `plugins/nestjs-api-architect/skills/nestjs-api-architect/SKILL.md` (+ `rules/`, `templates/`) and `scaffold-nestjs-api`, `add-nestjs-module`, `add-nestjs-use-case`, `add-nestjs-shared-op`, `add-nestjs-migration`.
- **Status:** shipped at `0.1.1` (its two manifest descriptions synced).

## test-optimizer

- **Purpose:** diagnose and fix test-suite performance problems — first target is runaway RAM/`node.exe` usage and OOM crashes during test runs. Container plugin: sibling test-optimization skills can land here later.
- **Behavior:** its `test-memory-doctor` skill triggers on memory/OOM/slow-suite symptoms across the three frameworks that coexist in a full-stack repo — Jest (NestJS), Vitest (React), Playwright — takes a `--logHeapUsage` (or peak-RSS) baseline, applies the correct per-framework fix (they differ meaningfully), then re-measures and shows before/after as evidence.
- **Implementation:** `plugins/test-optimizer/skills/test-memory-doctor/SKILL.md` + per-framework `references/{jest-nestjs,vitest-react,playwright}.md`.
- **Status:** shipped.

## context-handoff

- **Purpose:** on demand, generate a cold-start `HANDOFF.md` so the session can be `/clear`ed or `/compact`ed and a fresh Claude with zero memory becomes productive in ~30 seconds — without re-doing work or re-making mistakes. Deliberately different from `/compact` (same-session summary that loses decision rationale) and from a generic state dump; written for the cold reader.
- **Behavior:** triggered by explicit pre-reset intent ("write a handoff", "prep for /clear", "context is getting full"). Gathers ground truth from git (`status`, `diff --stat`, branch) and whatever memory tooling exists (`.remember/`, claude-mem, context-mode timeline — degrading gracefully to git + the live conversation), then writes eight fixed sections — Objective (+why), Status, Decisions made (+reasoning), State on disk, Verification (verified-vs-claimed), Next actions, Landmines, Resume ritual — and gitignores the file. General-purpose: no repo-specific paths baked in.
- **Implementation:** `plugins/context-handoff/skills/handoff/SKILL.md` (+ `references/handoff-spec.md`, `templates/handoff.md`).
- **Status:** shipped.

## prompt-creator

- **Purpose:** rewrite a rough prompt the user intends to give Claude Code into one that follows the official [best-practices doc](https://code.claude.com/docs/en/best-practices) — always grounded in the live page, which it re-fetches on every invocation.
- **Behavior:** auto-triggers on "improve/rewrite this prompt", "make this prompt better" (also manual `/prompt-creator`). Fetches three URLs fresh each time — the best-practices page (the rubric) plus [model-config](https://code.claude.com/docs/en/model-config) and [sub-agents](https://code.claude.com/docs/en/sub-agents) for model and effort selection — each falling back to a bundled date-stamped reference with a staleness warning if its fetch fails. Then **names the request's shape out loud** — one-shot task, bug, large feature, exploratory, or unattended run — so the user can correct it before the rewrite. A *large feature* still yields a prompt, never a hand-off: the guidance's interview kickoff prompt adapted to that feature, ending in a spec to execute in a fresh session. When something the rewrite depends on is ambiguous it asks **one question per message**, multiple choice where the options are knowable, and holds back the clear parts until the unclear ones resolve (never guesses). **Assigns models explicitly whenever the rewritten prompt dispatches work** — subagents, parallel agents, or a workflow — naming a model per agent with one clause of justification each, so no dispatched agent silently inherits the main session's model; a single-agent prompt is left alone and gains no model line it doesn't need. It never picks the session's own model and never executes the dispatch. Delivers the rewritten prompt in a copy-paste-ready block, **a line naming the guidance actually used** (live URL + fetch date, or the fallback plus its staleness warning), a "what changed & why" list tied to specific rules (model assignments included), and an offer to run it now or in a fresh session. The rubric lives in one place — the body points at the fetched page rather than restating it. Does not execute the task itself and does not cover system prompts for the user's own LLM apps.
- **Implementation:** `plugins/prompt-creator/skills/prompt-creator/SKILL.md` + `references/best-practices-checklist.md` (offline fallback, structured around the live page's ten body sections) + `references/model-selection.md` (offline fallback for the two model pages: alias and effort tables, the four-step subagent model-resolution order, and an explicit note on what those pages do *not* say) + plugin-root `evals/` — 7 cases for `claude plugin eval`, incl. a negative trigger, an `offline` case run without the WebFetch grant so the fallback fires, a fan-out case that must assign models, and a single-agent case that must not. The old skill-absent case is now the runner's built-in no-plugin arm.
- **Status:** shipped at `0.3.1`, which moved the evals to `claude plugin eval` and refreshed the model fallback for Opus 5.5 (its effort levels and `medium` default, effort caps, forks, `omitClaudeMd`). `0.3.0` added explicit model assignment for prompts that dispatch work. `0.2.0` applied all seven proposals (P1–P7) in [prompt-creator-superpowers-lessons.md](./prds/prompt-creator-superpowers-lessons.md); its four rejected proposals stay rejected.

## linear-flow

- **Purpose:** drive Linear through its MCP tools using the user's own workspace conventions, so day-to-day tracking doesn't mean restating those conventions every session. A prompt layer over the tools — it does not reimplement the Linear API.
- **Behavior:** five skills, all prefixed `ln-`. `ln-triage` takes a rough description, decides project-vs-issue by the workspace's rule (asking when genuinely ambiguous), and creates it. `ln-whats-next` is read-only and answers "what should I work on", ranking in-progress → blocked → near-delivery → current-client and grouping by client/project. `ln-ship-loop` reads branch, commits, and PR to find or create the matching issue, attach the PR, and propose the status move — it never commits, pushes, or opens PRs. Attaching a PR anywhere in the plugin first asks what it *is* to the issue — resolves, contributes to, or merely related — which titles the link and caps how far the status proposal may go; a project PR routes to an issue under it, since not every MCP server exposes a project link. `ln-project-lifecycle` and `ln-issue-lifecycle` are the symmetric pair for work whose shape is already known, covering creation plus every later edit; the issue side adds comments, sub-issues, and bulk grooming behind a hard "never write to a set you haven't listed back" guard. Every mutating call is shown and confirmed first.
- **Config contract:** ships generic — no team key, client name, or label string anywhere in it. Workspace knowledge splits in two: *discoverable* values (teams, statuses, labels, templates) are read live from the Linear tools at use time, never hardcoded; *judgment* rules (project-vs-issue, naming patterns, description shapes, status meanings) resolve from `~/.claude/linear-conventions.md` if it exists, else the bundled `references/conventions.md`, else the user is asked. That split is what makes the plugin shippable to anyone.
- **Implementation:** `plugins/linear-flow/skills/ln-{triage,whats-next,ship-loop,project-lifecycle,issue-lifecycle}/SKILL.md` + `evals/evals.json` each; plugin-root `references/{conventions,linear-mcp,pr-relations}.md` and `templates/{workspace-conventions,project-description,discovery-description}.md` shared across skills; skill-local `ln-issue-lifecycle/references/bulk-grooming.md`.
- **Requires:** a Linear MCP server configured in the session. The only plugin here with a runtime dependency — see [STACK.md](./STACK.md).
- **Status:** shipped at `0.2.0` (gained the PR relation gate).

## marketing-skills

- **Purpose:** a bundle of 41 cross-referencing marketing skills — SEO, AI search (AEO/GEO), CRO, analytics, schema, copywriting, ads, email, social, PR, pricing, and more.
- **Behavior:** each skill is independently triggerable and links to siblings; many carry `references/` deep-dive docs.
- **Implementation:** `plugins/marketing-skills/skills/<skill>/SKILL.md`. **Derived** from a third-party repo — see [../NOTICE](../NOTICE) and review the upstream license before public distribution.
- **Status:** shipped at `0.1.1` (its two manifest descriptions synced).
