# Sizing signals

How to read a project and turn what it holds into a tier. Every signal is recorded with the path it came from; the proposal cites that path.

## Signals to collect

| Signal | Where to look |
|---|---|
| Apps, packages and stacks | Workspace manifests (`package.json` `workspaces`, `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `go.work`, `Cargo.toml` `[workspace]`), single manifests (`package.json`, `go.mod`, `pyproject.toml`, `Gemfile`, `pom.xml`, `build.gradle`, `*.csproj`), and top-level app directories (`apps/*`, `packages/*`, `services/*`). |
| Code volume | File and line counts per area, from a command that prints totals. Exclude `node_modules`, `vendor`, `dist`, `build`, `.git`. |
| Existing docs | `docs/PRD.md`, `docs/ROADMAP.md`, `docs/CONVENTIONS.md`, `docs/ARCHITECTURE.md`, `AGENTS.md`. |
| Delivery | `.github/workflows/`, `.gitlab-ci.yml`, `Dockerfile`, `docker-compose*.yml`, `infra/`, `terraform/`, `k8s/`, `helm/`, deploy configs (`fly.toml`, `vercel.json`, `wrangler.toml`). |
| Risk | Auth, personal data, payments, consent and legal text: auth libraries or directories, user or customer tables, payment SDKs, privacy or terms pages. |
| Non-code work | `marketing/`, `legal/`, `content/`, `design/`, `brand/`, `docs/marketing/` and similar. |
| Existing agent setup | `.claude/agents/`, any `OPERATING-MODEL.md`, `CLAUDE.md`. Only `.claude/agents/` or an `OPERATING-MODEL.md` switches the skill to update mode; `CLAUDE.md` alone does not. |

A ROADMAP item for an area with no code yet is not a signal by itself; it becomes one only when the owner confirms it (question 2). Cite the ROADMAP path, or ``owner answer, question 2`` when there is none.

## Counting justified areas

Each of these counts as **one** area when the repo has a signal for it:

- each app or stack (a monorepo's `apps/web` and `apps/api` are two; a single-app repo is one);
- infra and CI together, as one area;
- risk data (personal data, auth, payments) as one area;
- each non-code front: marketing, legal, content, design — one area each.

Libraries shared by several apps belong to the area of their main consumer, not to an area of their own, unless they are a published product.

## Tiers

| Tier | Justified areas | Shape |
|---|---|---|
| Small | 1–2 | No leads. The main session dispatches two to four specialists directly. |
| Medium | 3–5 | One lead per area, each with its specialists. |
| Large | 6+ | Same shape as Medium, with more areas. |

**Tie-break.** Code volume moves a project across a boundary only at a count next to it. As starting values: 3 areas with under about 5,000 lines of code in total may stay Small; 2 areas where one holds over about 50,000 lines may go Medium; the same applies at 5 and 6 between Medium and Large. These thresholds are starting values to tune against the eval cases, not facts about every project.

## Picking agents

- **Small tier:** two to four specialists, chosen by the work the repo shows: typically one per stack, plus a read-only reviewer. No lead.
- **Medium and Large:** one lead per area. Each lead gets the specialists its area's signals justify — never a specialist "for later". Add one read-only reviewer for quality (or a quality lead in Large tier) and a risk reviewer when the risk area exists.
- Every agent's line in the proposal ends in `Signal: \`<path>\``. An agent you cannot tie to a path is not proposed.
