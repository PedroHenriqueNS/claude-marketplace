---
status: in-progress
---

# Best-practices compliance gate for all skills

**Serves product goal:** "Keep manifests valid (`claude plugin validate`) and versions in sync" — extended from manifest validity to *best-practices* validity, so every plugin is held to the Claude Code best-practices baseline now recorded in `docs/CONVENTIONS.md`.

> **Non-goal note (read before building):** `docs/PRD.md` currently lists "No automated publishing/CI yet" as a non-goal. This feature **deliberately supersedes** that for the *validation* half: it introduces CI. `docs/PRD.md` should be revisited to narrow that non-goal to publishing only. This PRD does **not** edit `docs/PRD.md` — that's a product-doc decision for the owner. The CI work itself is already anticipated by `docs/ROADMAP.md` Phase 2.

## Problem Statement

A new project rule says *all skills and plugins must follow Claude Code best practices* (`docs/CONVENTIONS.md` › "Claude Code best practices"). Right now that rule has no teeth: nothing checks whether the six existing plugins actually comply, and nothing stops a new or edited skill from landing non-compliant. The marketplace's whole value is the quality of its skills, so a rule that lives only as prose will quietly rot — exactly the failure mode the living-docs contract is meant to prevent. The owner needs the rule to be *enforced*, not just *stated*, and needs the existing skills brought up to the baseline.

## Solution

From the owner's perspective:

1. **Every existing plugin is audited once** against the best-practices baseline and any gaps are fixed, establishing a clean compliance baseline.
2. **Every future change is gated**: opening or updating a PR (and pushing to `main`) runs a check that fails when a skill violates the baseline or a manifest is invalid, and passes when everything complies. The owner reads a pass/fail signal instead of hand-reviewing every skill.
3. The check reuses what already exists — the `skill-auditor` plugin in this very marketplace and the `claude plugin validate` CLI — rather than inventing a new quality system.

## User Stories

1. As the marketplace owner, I want every existing plugin audited against the best-practices baseline, so that I know which skills are already compliant and which need work.
2. As the marketplace owner, I want concrete, per-skill findings from the audit, so that fixing a non-compliant skill is a clear task and not a guess.
3. As the marketplace owner, I want non-compliant skills brought up to the baseline, so that the published catalog matches the rule I wrote.
4. As the marketplace owner, I want a CI check that runs `claude plugin validate` on the marketplace and each plugin, so that a malformed manifest can never merge.
5. As the marketplace owner, I want the CI check to verify each plugin's `plugin.json` version matches its `marketplace.json` entry, so that the version-drift pitfall is caught automatically instead of by memory.
6. As the marketplace owner, I want the CI check to enforce the mechanical best-practice rules (frontmatter has `name` + `description`, no banned/non-standard frontmatter, `SKILL.md` within a size budget, no dead repo-relative links), so that the cheap-to-check violations never reach review.
7. As the marketplace owner, I want a deeper `skill-auditor` pass available for the judgment-based rules (does the `description` drive triggering, is reference material split out for progressive disclosure), so that quality the linter can't measure still gets reviewed.
8. As a contributor (human or agent) adding a new plugin, I want the gate to tell me exactly which best-practice rule I broke, so that I can fix it before merge without reading the whole conventions doc.
9. As a contributor editing an existing skill, I want the same gate to run on my change, so that I can't silently regress a skill below the baseline.
10. As an agent working in this repo unattended, I want a pass/fail signal I can read in the conversation, so that I can iterate until the check passes without a human in the loop.
11. As the marketplace owner, I want the compliance criteria to point at `docs/CONVENTIONS.md` as the single source of truth, so that the gate and the documented rule can never drift apart.
12. As the marketplace owner, I want the audit findings recorded as fixes-in-progress, so that bringing the catalog to baseline is trackable across sessions.
13. As the marketplace owner, I want `marketing-skills` (the derived plugin) audited too, so that recreated content meets the same bar as original content.
14. As a future contributor, I want the gate to run identically locally and in CI, so that I can reproduce a failure before pushing.

## Implementation Decisions

- **New module: a CI workflow under `.github/workflows/`.** The repo has no `.github/` today (`docs/STACK.md` records "No CI yet"); this introduces it. The workflow is the enforcement surface.
- **The gate is layered, by cost and by what's mechanically checkable:**
  - *Hard gate (blocking, fast, no model needed):*
    1. `claude plugin validate .` + `claude plugin validate ./plugins/<name>` for every plugin — manifest correctness.
    2. Version-sync check — each plugin's `plugin.json` `version` equals its `marketplace.json` entry `version` (guards the [version-drift pitfall](../PITFALLS.md)). A small script, not a new dependency.
    3. Mechanical best-practice lint of each `SKILL.md` — frontmatter present with `name` + `description`, no banned/non-standard frontmatter or persona preambles, body within a size budget, no dead repo-relative links. These are the scriptable subset of the [CONVENTIONS best-practices section](../CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows).
  - *Deep audit (judgment-based):* the `skill-auditor` plugin evaluates the rules a linter can't — whether `description` is written for triggering, whether progressive disclosure is used, overall leanness. Because `skill-auditor` is a Claude *skill* (not a CLI), running it as a hard, blocking CI gate requires non-interactive Claude (`claude -p`) with model access. **Decision:** run it as the audit mechanism for the one-time baseline pass and as a non-blocking / on-demand CI job, not a hard merge blocker, unless/until non-interactive Claude in CI is set up. The hard gate stays the three scriptable checks above.
- **Single source of truth for criteria:** the gate's rules are defined by `docs/CONVENTIONS.md` › "Claude Code best practices". The workflow references that section; it does not restate the rules (no duplication — same contract as the rest of the docs).
- **Verification seam is per-plugin** (see Testing Decisions): one audit report + one validate run per plugin, the highest seam available in a no-application-code repo.
- **No new runtime dependency** beyond the `claude` CLI (already required) and GitHub Actions. The mechanical lint is a small script in whatever's already available in the runner.
- **Scope ordering:** the one-time audit-and-remediate of the six existing plugins comes first (establishes a green baseline); the CI gate lands second (keeps it green). A PR that adds CI while the catalog is still red would block all other work.

## Testing Decisions

- **What a good test is here:** this repo has no application code, so "tests" verify *external behavior of the gate* — given a compliant catalog the check passes; given a known violation (bad manifest, drifted version, missing `description`, oversized `SKILL.md`) the check fails with a message naming the offending plugin/skill and rule. We do **not** test `skill-auditor`'s or `claude plugin validate`'s internals — they're trusted tools.
- **Seam (chosen in Step 2, confirmed):** per-plugin. Each plugin is verified by (a) `claude plugin validate ./plugins/<name>` and (b) a `skill-auditor` audit of its skills against the CONVENTIONS best-practices section. This is the single highest seam — one report + one validate per plugin — matching the [ARCHITECTURE](../ARCHITECTURE.md) three-layer model (the plugin is the natural unit).
- **Modules tested:** all six plugins' `SKILL.md` files and manifests, plus `marketplace.json` itself.
- **Prior art:** `docs/ROADMAP.md` Phase 2 already scopes "CI that runs `claude plugin validate`" and "a check that each `plugin.json` version matches its `marketplace.json` entry" — this feature is the realization of those two items plus the best-practice lint. The `skill-auditor` plugin is prior art for the audit logic. No existing test harness to extend (none exists yet).
- **Conventions that apply** (`docs/CONVENTIONS.md` › Testing): `claude plugin validate` is *the* gate and must pass before merge; skills may carry `evals/evals.json` and those should be kept current — the gate can additionally surface skills lacking evals as a warning.
- **Pitfalls the gate must guard against** (`docs/PITFALLS.md`): version drift between the two manifests (hard-gated by the version-sync check); reserved `claude-*`/`anthropic-*` marketplace-name prefix; relative `source` paths that must resolve (both covered by `claude plugin validate`); dead repo-relative links in derived content (covered by the mechanical lint).

## Out of Scope

- Editing `docs/PRD.md` to narrow its CI non-goal — flagged for the owner, not done here.
- Publishing/release automation (npm, tags, GitHub releases) — this is the *validation* half of CI only; publishing remains a non-goal.
- Remote distribution (push to GitHub) — that's `docs/ROADMAP.md` Phase 1, independent of this gate (though CI only runs once the repo is on GitHub).
- Setting up non-interactive Claude (`claude -p` + API credentials) in CI to make the deep `skill-auditor` pass a hard blocker — noted as a follow-up enhancement, not required for this feature.
- Authoring new plugins or new skills — this feature gates and audits *existing and future* skills; it doesn't add capabilities.
- Reviewing the `marketing-skills` upstream license (that's a Phase 1 / NOTICE concern, separate from best-practices compliance).

## Further Notes

- This feature is the direct, forward-looking consequence of the two changes made earlier in this session: writing the "all skills follow Claude Code best practices" rule into `docs/CONVENTIONS.md`, and distilling the best-practices page into that doc. The rule now gets an enforcement mechanism.
- Because the deep audit depends on a Claude skill rather than a CLI, expect the *hard* gate to stabilize on the three scriptable checks, with `skill-auditor` as the higher-fidelity audit run on demand and during the one-time baseline. If/when non-interactive Claude in CI is set up, promote the `skill-auditor` pass to a blocking gate and update this PRD's status.
- Keep the gate's rule list pointing at `docs/CONVENTIONS.md`; if a new best-practice rule is added there, the gate should pick it up, not maintain its own copy.
