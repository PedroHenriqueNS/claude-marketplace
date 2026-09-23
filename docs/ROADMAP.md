# Roadmap

Phased plan. Update this whenever priorities shift, a milestone is reached, or new work is scoped.

## Phase 0 — Foundation ✅ (done)

- Marketplace catalog with six plugins, each at `0.1.0`.
- Local install working (`/plugin marketplace add <path>`).
- README, NOTICE, `.gitignore`, `.gitattributes` in place.
- Living agent docs scaffolded (this `docs/` set + `AGENTS.md`/`CLAUDE.md`).

## Phase 1 — Remote distribution (next)

- Push to `github.com/PedroHenriqueNS/claude-marketplace`.
- Verify remote install: `/plugin marketplace add PedroHenriqueNS/claude-marketplace` → `/plugin install <name>@pedrohenriquens`.
- Confirm `claude plugin validate .` passes in a clean clone.
- Before making `marketing-skills` publicly installable, review the upstream license per [../NOTICE](../NOTICE).

## Phase 2 — Validation automation (in-progress)

Realized by the **[best-practices compliance gate](./prds/best-practices-compliance-gate.md)** PRD. It supersedes the `docs/PRD.md` "no CI yet" non-goal for the validation half (publishing stays out).

- ✅ Mechanical compliance gate (`scripts/check_compliance.py`): version-sync, frontmatter, dead repo-relative links, reserved-name guard — green across all 11 plugins. Since 2026-09-23 it also hard-fails on description drift between the two manifests and on the Agent Skills `name`/`description` limits.
- ✅ CI (`.github/workflows/validate.yml`) runs the compliance script + `claude plugin validate .` + each `claude plugin validate ./plugins/<name>` on PRs and pushes to `main`. (Runs once the repo has a remote — Phase 1.)
- ✅ Behavior evals run on `claude plugin eval` (Claude Code ≥ 2.1.269), piloted on `prompt-creator`: 7 cases, each scored with and without the plugin. Manual by decision, since every run costs model usage, so not a CI gate ([anthropic-updates PRD](./prds/anthropic-updates-2026-09.md), Q5).
- ⏳ Convert the other 46 per-skill `evals.json` files (39 of them in `marketing-skills`) to runner cases, now that the pilot shows the runner separating the plugin's behavior from the baseline.
- ⏳ Deep `skill-auditor` audit of all 61 skills against the [CONVENTIONS best-practices baseline](./CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows) for the judgment-based rules (`description` quality, progressive disclosure). Run on demand; not a blocking CI gate until non-interactive Claude is wired into CI.
- ⏳ Extend `scripts/check_compliance.py` to flag a plugin version string in `docs/*.md` that disagrees with its `plugin.json` — see [PITFALLS.md](./PITFALLS.md) 2026-07-31 entry.

## Phase 3 — Growth (when scoped)

- ✅ `test-optimizer` (skill `test-memory-doctor`) — first Phase 3 growth plugin; diagnoses and fixes runaway test-run memory/OOM across Jest (NestJS), Vitest (React), and Playwright.
- ✅ `context-handoff` (skill `handoff`) — cold-start `HANDOFF.md` generator for surviving `/clear` / `/compact`; shipped at `0.1.0`.
- ✅ `prompt-creator` (skill `prompt-creator`) — rewrites rough Claude Code prompts against the live best-practices doc (re-fetched every invocation, offline fallback checklist); shipped at `0.3.1`, which moved its evals to `claude plugin eval`. `0.3.0` added explicit model assignment — a rewritten prompt that dispatches subagents, parallel agents, or a workflow now names a model per agent with one clause of justification, instead of letting them silently inherit the main session's model; step 1 fetches [model-config](https://code.claude.com/docs/en/model-config) and [sub-agents](https://code.claude.com/docs/en/sub-agents) alongside the best-practices page, each with its own dated fallback (`references/model-selection.md`). `0.2.0` applied all seven proposals (P1–P7) in [prompt-creator-superpowers-lessons.md](./prds/prompt-creator-superpowers-lessons.md): a `description` that no longer summarizes its own workflow (P1), one authority for the rubric instead of two (P2), a fallback checklist rebuilt around the live page's ten body sections (P3), a request-shape naming step (P4), a source-and-date line in the deliverable (P5), a tightened ambiguity protocol (P6), and a skill-absent baseline arm in the evals (P7). Its four rejections stay rejected.
- ✅ `project-initializer` gains a second skill, `update-for-model` — re-tunes an existing project's living docs for one user-chosen Claude model, writing `docs/MODEL-NOTES.md` and linking to it from the docs it affects; `project-initializer` bumped to `0.2.0`, then `0.2.1` when its doc URLs moved to `platform.claude.com`.
- ✅ `linear-flow` (skills `ln-triage`, `ln-whats-next`, `ln-ship-loop`, `ln-project-lifecycle`, `ln-issue-lifecycle`) — drives Linear through its MCP tools from a user-supplied conventions file, shipping generic with no workspace values baked in; shipped at `0.2.0` (gained the PR relation gate). First plugin here with a runtime dependency on an external MCP server.
- Add new plugins as needs arise; each lands with its `marketplace.json` entry, `plugin.json`, and at least one skill in the same PR.
- Add eval cases (`plugins/<name>/evals/`) to plugins that lack them, to guard triggering quality.

### Follow-up from `update-for-model`

Choosing a target Claude model has knock-on effects on the other plugins' skills. `prompt-creator` `0.2.0` is the first one acted on; the rest are still open.

- ✅ `prompt-creator` done, in two halves. Its bundled checklist now carries the reviewer-scoping deviation in-file (recorded in [MODEL-NOTES.md](./MODEL-NOTES.md) § *Prompting adjustments*). Both of its `description` fields were rewritten to drop the workflow summary. **Q6's gate is now live:** that rule is plugin-local until P1's before/after evidence exists. The runnable arm now exists (`claude plugin eval`, see Phase 2); what is still missing is the run comparing the description with and without its workflow summary. Run it, then decide whether the no-workflow-summary rule goes catalogue-wide in [CONVENTIONS.md](./CONVENTIONS.md).
- ⏳ Target model: **Claude Opus 5.5** (re-targeted from Opus 5 on 2026-09-23) — see [MODEL-NOTES.md](./MODEL-NOTES.md). Review the other 10 plugins' skills against its guidance. The likely hot spot is trigger-language calibration: `description` wording tuned to stop a former model from *under*-triggering can make a newer, more instruction-sensitive model *over*-trigger. Re-check the `disable-model-invocation` choices at the same time.
- ⏳ `linear-flow` is in scope here too, despite being authored *after* the model was chosen — the adversarial review of that change left two findings open against this very item, both accepted knowingly rather than fixed. All five `ln-*` skills ship without `disable-model-invocation` while creating, relabelling, bulk-rewriting and closing Linear items; that was a deliberate call to preserve auto-triggering, and it is worth re-testing now that bulk grooming exists. Separately, several trigger phrases carry no Linear anchor — "close these", "relabel these", "groom the backlog", "track this" — which is exactly the over-triggering risk described above. The two compound: an unanchored phrase loads a write-capable skill.
- ⏳ Decide whether `update-for-model` should ever edit sibling plugins' `SKILL.md` files, or stay scoped to living docs only (current behavior: living docs only).

> TODO: Decide whether to adopt a release/versioning convention (e.g. tags per plugin) once there are external consumers.
