# Model notes — Claude Opus 5

> This project's agent documentation is tuned for **Claude Opus 5** (`claude-opus-5`). Sourced from Anthropic's live docs on **2026-07-30** — see [Sources and staleness](#sources-and-staleness). Everything here is the **delta** for this model; guidance true of every Claude model belongs in the normal docs, not here. Targeting a different model? Re-run `update-for-model` — do not hand-edit this file into a second model's notes.

## What changes on this model

| Behavior on Opus 5 | What to do differently here |
|---|---|
| Delegates to subagents more readily than prior models. | Delegate only for genuinely independent, sizeable work — a wide multi-plugin audit qualifies; a single skill edit does not. Never spawn a subagent to double-check your own work. |
| Follows review-scoping instructions **literally** — telling a reviewer "only report high-severity issues" makes it report less. | When running a review here, ask for everything and filter in a second pass rather than pre-narrowing the reviewer's remit. |
| Files it writes to disk (Markdown, reports, summaries) run longer than on prior models. | Directly relevant: this repo's product *is* Markdown. Expect first drafts of a `SKILL.md` to need trimming, and hold the 20KB size budget and progressive-disclosure rule in [CONVENTIONS.md](./CONVENTIONS.md). |
| User-facing responses run longer; `effort` controls how much it *thinks*, not how much it *says*. | Prompt for concision explicitly — lowering effort will not shorten a reply. |
| Catches and fixes its own mistakes well. | Drop "double-check your answer" / "re-verify before responding" instructions; they compound with behavior the model already has. |
| Completes full tasks from a complete spec, and performs best given the whole task up front. | Front-load the entire task when authoring skill bodies and prompts, rather than drip-feeding steps. |

## Deliberate deviations

Anthropic's Opus 5 guidance says to remove standing verification instructions — including "use a subagent to verify" — because the model verifies its own work and such instructions cause over-verification.

**This project keeps its adversarial review step anyway** ([CONVENTIONS.md › Working in this repo](./CONVENTIONS.md#working-in-this-repo): run the bundled `/code-review` skill before treating work as complete). This is an informed, deliberate choice by the repo owner, not an oversight. Do not remove it citing the model docs.

Rationale: on the change that introduced `update-for-model`, that review caught two real defects — an approval gate placed on the wrong action (a destructive file overwrite ran ungated while trivial edits were gated) and a missing fetch-failure path. The guidance targets instructions that fire automatically on every task; here the step is short, deliberate, and has demonstrated value on this repo's content.

## Harness settings

- Model `claude-opus-5`. Thinking is **on by default** and can be disabled only at effort `high` or below.
- Effort default is `high`. Use `low`/`medium` liberally for this repo's mechanical work — version bumps, manifest edits, count sweeps — where quality holds at a fraction of the tokens. Step up to `xhigh` for multi-plugin refactors.
- Keep thinking **enabled** and control cost with effort instead of disabling it. With thinking off, Opus 5 can occasionally write a tool call as plain text (it never runs) or leak internal XML tags into its visible response.
- Context window: 1M tokens, both default and maximum.

See [Claude Code model configuration](https://code.claude.com/docs/en/model-config) for how to select the model and effort.

## Prompting adjustments

- **Skill `description` fields.** Trigger wording tuned to stop an older model *under*-triggering can make a more instruction-sensitive model *over*-trigger. Opus 5 is now the model to calibrate the 61 skill descriptions against — tracked in [ROADMAP.md](./ROADMAP.md#follow-up-from-update-for-model).
- **Reviews.** Ask for all findings, then filter. See the literal-instruction row above.
- **`prompt-creator`'s bundled checklist** advises telling a reviewer to "flag only gaps affecting correctness or stated requirements" — the pattern Opus 5 follows too literally. It is a plugin file, out of scope for `update-for-model`, and is covered by the same ROADMAP follow-up.

## Not affected

The mechanical gate (`scripts/check_compliance.py` + `claude plugin validate`, with output shown as evidence) — those are real commands with pass/fail output, not model self-verification. Also unchanged: Conventional Commits, the two-manifest version rule, the Mermaid diagramming policy, progressive disclosure, and the reserved-name guard.

The 1M context window does **not** relax the `SKILL.md` size budget. That budget exists because every session that triggers a skill loads its whole body, not because the window is small.

## Sources and staleness

Fetched 2026-07-30 — all live, no fallback used:

- Models overview — <https://docs.claude.com/en/docs/about-claude/models/overview>
- Prompting Claude Opus 5 — <https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompting-claude-opus-5>
- What's new in Claude Opus 5 — <https://docs.claude.com/en/docs/about-claude/models/whats-new-opus-5>
- Migration guide — <https://docs.claude.com/en/docs/about-claude/models/migration-guide>
- Claude Code model configuration — <https://code.claude.com/docs/en/model-config>

Model docs change with every release. If the fetch date above is old, or the project has switched models, re-run `update-for-model` rather than trusting this file.
