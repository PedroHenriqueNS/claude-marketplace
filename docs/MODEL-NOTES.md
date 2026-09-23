# Model notes — Claude Opus 5.5

> This project's agent documentation is tuned for **Claude Opus 5.5** (`claude-opus-5-5`). Sourced from Anthropic's live docs on **2026-09-23** — see [Sources and staleness](#sources-and-staleness). Everything here is the **delta** for this model; guidance true of every Claude model belongs in the normal docs, not here. Targeting a different model? Re-run `update-for-model` — do not hand-edit this file into a second model's notes.

These notes replace the Claude Opus 5 notes of 2026-07-30. Anthropic's Opus 5.5 prompting page says Opus 5 prompts carry over without changes and that the Opus 5 patterns remain a reasonable starting point, so the Opus 5 rows that still hold are kept below, marked *(from Opus 5)*.

## What changes on this model

| Behavior on Opus 5.5 | What to do differently here |
|---|---|
| Thinking is always on and cannot be turned off; effort is the control for how much it thinks. | Drop any "thinking off" setup. For less thinking, lower the effort level — prompt instructions to think less are less reliable. |
| Default effort is `medium` (Opus 5: `high`), and at a given level it thinks more per turn than Opus 5, most at `xhigh` and `max`. In Anthropic's testing, `medium` matched or beat Opus 5 at `high` on coding and knowledge work. | Don't carry over the Opus 5 effort setting: `medium` for normal work, `low` for mechanical edits (version bumps, manifest edits, count sweeps), `xhigh` or `max` only where a quality gain was seen. |
| Decides for itself how much to think. Prompts that push it to write its internal reasoning into the reply can be declined (`reasoning_extraction` refusal). | Skills here must not ask it to "think carefully first" or to show step-by-step reasoning in the reply; say what to produce and leave thinking to effort. |
| On long multi-part tasks it posts progress updates, and some of them end the turn with text instead of a tool call. | In unattended runs — `claude -p`, `claude plugin eval` cases — treat a text-only end of turn as a report, not as done. |
| Delegates to subagents more readily than prior models *(from Opus 5)*. | Delegate only genuinely independent, sizeable work — a wide multi-plugin audit qualifies; a single skill edit does not. Never spawn a subagent to double-check your own work. |
| Follows review-scoping instructions literally: "only report high-severity issues" makes it report less *(from Opus 5)*. | Ask a reviewer for everything, then filter in a second pass. |
| Files it writes to disk run longer than prior models' *(from Opus 5)*. | This repo's product is Markdown: expect a first-draft `SKILL.md` to need trimming, and hold the 20 KB budget and progressive disclosure in [CONVENTIONS.md](./CONVENTIONS.md). |
| User-facing replies run long; effort controls how much it thinks, not how much it says *(from Opus 5)*. | Ask for concision explicitly, or switch on the Concise output style (see Harness settings). |
| Catches and fixes its own mistakes; standing "verify your work" instructions cause over-verification *(from Opus 5)*. | Drop "double-check" and "re-verify" lines. The review step below is a deliberate exception. |
| Performs best given the complete task up front, and finishes it rather than leaving stubs *(from Opus 5)*. | Front-load the whole task in skill bodies and prompts instead of drip-feeding steps. |

## Deliberate deviations

The Opus 5 guidance, still the starting point for Opus 5.5, says to remove standing verification instructions — including "use a subagent to verify" — because the model verifies its own work.

**This project keeps its adversarial review step anyway** ([CONVENTIONS.md › Working in this repo](./CONVENTIONS.md#working-in-this-repo): run the bundled `/code-review` skill before treating work as complete). This is an informed, deliberate choice by the repo owner, not an oversight. Do not remove it citing the model docs.

Rationale: on the change that introduced `update-for-model`, that review caught two real defects — an approval gate placed on the wrong action (a destructive file overwrite ran ungated while trivial edits were gated) and a missing fetch-failure path. The guidance targets instructions that fire automatically on every task; here the step is short, deliberate, and has demonstrated value on this repo's content. Per Anthropic's testing, Opus 5.5 also reviews code better than Opus 5: more real bugs caught, fewer false alarms.

## Harness settings

- Model `claude-opus-5-5`. From Claude Code v2.1.280 — the minimum version for Opus 5.5 — the `opus` alias resolves to it on the Anthropic API, and it is the default model on Pro, Max, Team, Enterprise, and the Anthropic API.
- Effort defaults to `medium`. A top-level `effortLevel` in your user settings file (the older `/effort` form) does not apply to Opus 5.5; choose a level for it with `/effort` or the `/model` picker, which saves one per model.
- Thinking cannot be turned off: the session toggle, `alwaysThinkingEnabled`, and `MAX_THINKING_TOKENS=0` have no effect on Opus 5.5.
- Context window 1M tokens, as on Opus 5. Knowledge cutoff June 2026: anything Anthropic shipped later must be fetched, not recalled.
- For shorter replies, the built-in Concise output style (`/output-style concise`, Claude Code v2.1.237+) leads with the result and drops narration and recaps without doing less work.

See [Claude Code model configuration](https://code.claude.com/docs/en/model-config) for how to select the model and effort.

## Prompting adjustments

- **Skill `description` fields.** Opus 5.5 is now the model to calibrate the 61 descriptions against; the bundled `/claude-api prompt-audit` flags wording written for older models. Tracked in [ROADMAP.md](./ROADMAP.md#follow-up-from-update-for-model).
- **Reviews.** Ask for all findings, then filter. `prompt-creator`'s bundled checklist has carried this deviation in-file since `0.2.0`.
- **Eval cases.** `claude plugin eval` runs are unattended: grade a concrete deliverable — a fenced prompt, a created file, a tool call — and give `max_turns` headroom, since a progress update can end a run early.

## Not affected

The mechanical gate — `scripts/check_compliance.py`, `claude plugin validate`, and eval runs, each shown as evidence — is real commands with pass/fail output, not model self-verification. Also unchanged: Conventional Commits, the two-manifest version rule, the Mermaid diagramming policy, progressive disclosure, and the reserved-name guard.

The 1M context window does **not** relax the `SKILL.md` size budget: every session that triggers a skill loads its whole body.

## Sources and staleness

Fetched 2026-09-23 — all live, no fallback used:

- Models overview — <https://platform.claude.com/docs/en/models/overview>
- Prompting Claude Opus 5.5 — <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5>
- Prompting Claude Opus 5 (the stated starting point) — <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5>
- What's new in Claude Opus 5.5 — <https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5>
- Migrating to Claude Opus 5.5 — <https://platform.claude.com/docs/en/models/opus-5-5/migration-guide>
- Claude Code model configuration — <https://code.claude.com/docs/en/model-config>
- Claude Code output styles — <https://code.claude.com/docs/en/output-styles>

Model docs change with every release. If the fetch date above is old, or the project has switched models, re-run `update-for-model` rather than trusting this file.
