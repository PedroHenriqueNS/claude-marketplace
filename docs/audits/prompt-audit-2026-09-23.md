# Prompt audit — Claude Opus 5.5, 2026-09-23

> The bundled `/claude-api prompt-audit` (Claude Code 2.1.280), run for the [anthropic-updates PRD](../prds/anthropic-updates-2026-09.md) (P6) and triaged against [CONVENTIONS.md](../CONVENTIONS.md). It is also the `prompt-audit` half of the `skill-auditor` `0.2.0` dry run (P5, [below](#skill-auditor-dry-run)).

## Scope and assumptions

- **Scope:** the 61 `plugins/*/skills/**/SKILL.md` files and the root `CLAUDE.md`, not the files it imports (those are the living docs `update-for-model` tunes).
- **Target model:** Claude Opus 5.5 (`claude-opus-5-5`), the owner's choice in PRD Q1.
- **Method:** the audit's greppable signals over every file first, then a full read of every file against its pattern tables and keep list — two read-only passes, one over `marketing-skills` (41 files) and one over the other 20 plus `CLAUDE.md`. Every finding below was triaged here; the triage, not the audit, decides what is applied.
- **Verification:** compliance and `claude plugin validate` for every touched plugin. None of the applied edits falls inside a runner eval case, so behavior is unverified by eval (PRD Q7).

## Summary

62 files audited. 42 came back clean (15 of the 21 core files, 27 of the 41 `marketing-skills` files) and 20 had findings.

- **Applied: 6 edits in 3 plugins** — `marketing-skills` (4), `to-prd` (1), `azure-devops-card` (1).
- **Declined: 8**, each with the rule that decided it.
- **Flagged, not edited: about 20**, almost all unsourced statistics in `marketing-skills`.
- **Greppable signals:** they matched 18 lines. All but one turned out to be domain content (a 10-word tagline limit, "remove navigation if possible") or real constraints (Google Ads character limits).

The patterns Opus 5.5 is most sensitive to are absent from all 62 files: prose steering how much to think, requests to show reasoning in the reply, update suppressors, and anti-formatting rules. The highest-impact findings are:

- **A real bug:** `seo-audit` read the product-context file by its legacy name.
- **Volume pressure:** `to-prd` pushed for "extremely extensive" user-story lists, on a model family that already writes long files.
- **Restated knowledge:** `marketing-psychology` spent almost a third of its size on textbook definitions the model already knows.

## `marketing-skills` (derived content)

27 of 41 files came back clean. The derived provenance did not show up as prompting fossils: the findings are mostly volatile statistics, plus one real bug.

### Applied

| Location | Pattern | Change |
|---|---|---|
| `seo-audit/SKILL.md:11` | 1d fossil | Pointed at `.agents/product-marketing-context.md` first, the legacy name. The other 36 skills that read that file check the canonical `.agents/product-marketing.md` first; this one now uses the same sentence. |
| `marketing-psychology/SKILL.md` | Group 2 — restates what the model knows | Dropped the one-line textbook definition from 66 of 72 mental models (Pareto, sunk cost, anchoring…), keeping each "Marketing application". Kept the definitions of the six less-common models the audit singled out (Lindy Effect, EAST, COM-B, BJ Fogg, Cobra Effect, Rule of 100). CONVENTIONS: "Don't restate what Claude already knows". The file went from 21.6 KB to 15.4 KB, back under the 20 KB budget. |
| `directory-submissions/SKILL.md:183` | Group 2 — volatile specifics | G2's price now carries "verify the current price — it was $2,999+/year as of Summer 2025". |
| `video/SKILL.md:125` | Group 2 — volatile specifics | The AI video model table now opens with a line to verify its specs and costs against each vendor's current docs. |

### Declined

| Location | Finding | Why declined |
|---|---|---|
| `offers/SKILL.md:3` | Trim near-synonym trigger phrases from the description (medium) | A trigger change needs a trigger eval before it ships — the same gate ROADMAP holds for description rules (Q6). Belongs with the conversion of this plugin's evals to runner cases. |
| `ads/SKILL.md:333-343` | Self-check block repeats the RSA limits (low) | Character-counting is a real weak spot and the limits are platform rules; the audit itself rated it low. |
| `copy-editing/SKILL.md:255-303` | Expert-panel scoring loop (low) | Idiom-dating only; the loop is already gated to launch copy. |

### Flagged, not edited (low confidence)

Unsourced or undated statistics presented as fact, which a literal model will relay as current: `ai-seo` (the "critical stats", the citation-share table, the Wikipedia/Reddit citation percentages), `directory-submissions` (about a dozen figures: conversion multiples, Product Hunt lifts, Typeform and Zapier numbers), `video` and `ads` (the same "85% watch without sound" figure), `referrals`, `revops`, `launch`, `ad-creative`, `churn-prevention`, `social`, plus HeyGen plan limits in `video` and the product-name repetition in `ai-seo`'s description. Sourcing or dating them is content work on derived text, not a model-tuning fix; tracked in [ROADMAP.md](../ROADMAP.md).

## The other 20 skills and `CLAUDE.md`

15 of 21 came back clean, `CLAUDE.md` and all five `linear-flow` skills among them. The many "confirm before writing" and "never write to a set you haven't listed back" gates across the catalog are safety text the audit's keep list protects, and none was flagged.

### Applied

| Location | Pattern | Change |
|---|---|---|
| `to-prd/SKILL.md:61-69` | 1a — pressure language | "A LONG, numbered list…" and "should be extremely extensive" became "one per distinct user-facing scenario the feature touches". [MODEL-NOTES](../MODEL-NOTES.md): the Opus 5 family already writes long files, so volume pressure pads. |
| `azure-devops-card/SKILL.md:127` | 1a — standing verification | Dropped "Confira de fato, não presuma:" ("check for real, don't presume"). The checklist under it stays: its items are the output's acceptance criteria. |

### Declined

| Location | Finding | Why declined |
|---|---|---|
| `project-initializer/SKILL.md:10-19`, `context-handoff/skills/handoff/SKILL.md:17-21`, `nestjs-api-architect/SKILL.md:31-39`, `tsconfig-upgrade/SKILL.md:10-21` | A "When to use" section restating the `description` (high and medium) | The audit's own keep list, item 8: redundancy that works and doesn't disagree is not cruft. In `project-initializer` and `context-handoff` the section also carries the "explicit invocation only" guard, which still acts when a description over-triggers — the risk MODEL-NOTES names for this model family. |
| `project-initializer/SKILL.md:136` | "This step is not optional — every initialization MUST run it" (1a) | CONVENTIONS reserves emphasis for rules that must stick, and this one states its reason beside it. The P1 pilot also caught Opus 5.5 skipping a procedural step (`prompt-creator`'s shape line, 2 of 3 runs), so softening a must-run step without an eval is the wrong trade. |

### Flagged, not edited

- `tsconfig-upgrade/SKILL.md:130` — "nodenext is not always achievable on NestJS 10" carries no date.
- `skill-auditor/SKILL.md:26,48` — CLI minimum versions. They come from the live docs, and a minimum version does not go stale the way a price does.
- `prompt-creator/SKILL.md:4-12` — five near-synonym trigger phrases; a trigger change needs a trigger eval.
- `update-for-model/SKILL.md:6` — model names used as trigger examples ("update the docs for Opus 5"); illustrative, not behavioral.

## `skill-auditor` dry run

`skill-auditor` `0.2.0` measures instead of estimating (P5). Both reports it now relies on were run on this repo:

- **`/skill-doctor`** (`claude -p "/skill-doctor"`, 2026-09-23) listed 60 of this marketplace's skills (`test-optimizer` was not loaded in that session); 48 had never been used. `marketing-skills` lists 41 skills for about 860 tokens per turn with 2 ever used; `prompt-creator` is the most used (112 uses), then `context-handoff` (28). Those are the numbers a removal or consolidation recommendation would cite.
- **`/claude-api prompt-audit`**: this report.
