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

- ✅ Mechanical compliance gate (`scripts/check_compliance.py`): version-sync, frontmatter, dead repo-relative links, reserved-name guard — green across all 10 plugins.
- ✅ CI (`.github/workflows/validate.yml`) runs the compliance script + `claude plugin validate .` + each `claude plugin validate ./plugins/<name>` on PRs and pushes to `main`. (Runs once the repo has a remote — Phase 1.)
- ⏳ Deep `skill-auditor` audit of all 56 skills against the [CONVENTIONS best-practices baseline](./CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows) for the judgment-based rules (`description` quality, progressive disclosure). Run on demand; not a blocking CI gate until non-interactive Claude is wired into CI.

## Phase 3 — Growth (when scoped)

- ✅ `test-optimizer` (skill `test-memory-doctor`) — first Phase 3 growth plugin; diagnoses and fixes runaway test-run memory/OOM across Jest (NestJS), Vitest (React), and Playwright.
- ✅ `context-handoff` (skill `handoff`) — cold-start `HANDOFF.md` generator for surviving `/clear` / `/compact`; shipped at `0.1.0`.
- ✅ `prompt-creator` (skill `prompt-creator`) — rewrites rough Claude Code prompts against the live best-practices doc (re-fetched every invocation, offline fallback checklist); shipped at `0.1.0`.
- ✅ `project-initializer` gains a second skill, `update-for-model` — re-tunes an existing project's living docs for one user-chosen Claude model, writing `docs/MODEL-NOTES.md` and linking to it from the docs it affects; `project-initializer` bumped to `0.2.0`.
- Add new plugins as needs arise; each lands with its `marketplace.json` entry, `plugin.json`, and at least one skill in the same PR.
- Add `evals/evals.json` to skills that lack them, to guard triggering quality.

### Follow-up from `update-for-model`

Choosing a target Claude model has knock-on effects on the other plugins' skills that this repo has **not** acted on yet — deliberately out of scope for the change that added the skill.

- ⏳ Once a target model is chosen for this repo, review the other 10 plugins' skills against that model's guidance. The likely hot spot is trigger-language calibration: `description` wording tuned to stop a former model from *under*-triggering can make a newer, more instruction-sensitive model *over*-trigger. Re-check the `disable-model-invocation` choices at the same time.
- ⏳ Decide whether `update-for-model` should ever edit sibling plugins' `SKILL.md` files, or stay scoped to living docs only (current behavior: living docs only).

> TODO: Decide whether to adopt a release/versioning convention (e.g. tags per plugin) once there are external consumers.
