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

## Phase 2 — Validation automation (planned — specced)

Realized by the **[best-practices compliance gate](./prds/best-practices-compliance-gate.md)** PRD (`status: ready-for-agent`). It supersedes the `docs/PRD.md` "no CI yet" non-goal for the validation half (publishing stays out).

- Audit & remediate all six existing plugins against the [CONVENTIONS best-practices baseline](./CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows) (via `skill-auditor`) to establish a green baseline.
- Add CI (GitHub Actions) that runs `claude plugin validate .` and each `claude plugin validate ./plugins/<name>` on every PR.
- Add a check that each plugin's `plugin.json` version matches its `marketplace.json` entry (the sync invariant — see [PITFALLS.md](./PITFALLS.md)).
- Add a mechanical best-practice lint of each `SKILL.md` (frontmatter, size budget, no dead links), with a deeper `skill-auditor` pass for the judgment-based rules.

## Phase 3 — Growth (when scoped)

- Add new plugins as needs arise; each lands with its `marketplace.json` entry, `plugin.json`, and at least one skill in the same PR.
- Add `evals/evals.json` to skills that lack them, to guard triggering quality.

> TODO: Decide whether to adopt a release/versioning convention (e.g. tags per plugin) once there are external consumers.
