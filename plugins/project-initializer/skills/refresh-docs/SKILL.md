---
name: refresh-docs
description: Use when the user explicitly asks to review or refresh the living docs of an EXISTING project (CLAUDE.md, AGENTS.md, docs/*) — phrases like "refresh the living docs", "review our AGENTS.md and docs", "our CLAUDE.md is too big", "the docs have drifted", "audit our project docs", or /refresh-docs. Reviews them for format, drift against the repo, and content, then proposes one batch of edits and writes nothing until the user approves. Do NOT use to re-tune docs for a Claude model ("update the docs for Opus 5.5") — that is update-for-model. Do NOT use on a project with no living docs yet — that is project-initializer. Do NOT use for a single edit the user has already dictated ("add this rule to CONVENTIONS.md") — just make that edit.
---

# Refresh docs

Review the living docs of a project that already has them, and propose the changes that bring them back to the formats in this plugin's templates and in line with the repo. Nothing is written until the user approves.

## Before you start

Find the living docs: `CLAUDE.md`, `AGENTS.md` and `docs/*.md` (plus any `<scope>/docs/CONVENTIONS.md`). If the project has none of `CLAUDE.md`, `AGENTS.md` or `docs/`, stop and point the user at the `project-initializer` skill.

Review with read-only tools only (Read, Glob, Grep). Run no shell command and write nothing until the user approves the batch; to count a file's lines, read it.

Ask for the content report in your first message, then start the format and drift lenses at once, without waiting for an answer. Ask the user to run `/doctor prompt-audit` and `/doctor prompt-audit docs/` and paste the output, or to paste such a report if they already have one. When it arrives, fold it into the report under lens 3. If it never arrives, deliver the report with lens 3 marked pending.

## Lens 1 — Format

Read the templates in this plugin's `templates/` folder — [claude-md.md](../../templates/claude-md.md), [agents-md.md](../../templates/agents-md.md), [conventions.md](../../templates/conventions.md), [pitfalls.md](../../templates/pitfalls.md), [pitfalls-history.md](../../templates/pitfalls-history.md), [architecture.md](../../templates/architecture.md), [features.md](../../templates/features.md), [roadmap.md](../../templates/roadmap.md), [stack.md](../../templates/stack.md), [summary.md](../../templates/summary.md), [prd.md](../../templates/prd.md) — and compare each existing doc with its template. Flag:

- imports in `CLAUDE.md` beyond the core (`AGENTS.md`, `docs/CONVENTIONS.md`, `docs/PITFALLS.md`, and `docs/MODEL-NOTES.md` when present); propose turning each into a plain Markdown link on the same list;
- an imported file over 200 lines, with its count and where its detail could move;
- a `PITFALLS.md` that was never split into rules plus `PITFALLS-HISTORY.md`;
- a missing status line in `ARCHITECTURE.md` or `SUMMARY.md`, a feature block without PRD or fixed status, a phase without **Done when:**;
- a maintenance map copied into `CONVENTIONS.md` instead of linked from `AGENTS.md`;
- a "Where conventions live" table that disagrees with the scoped `CONVENTIONS.md` files on disk.

Leave alone any import that belongs to another plugin or tool, such as `@docs/OPERATING-MODEL.md`. Don't flag a structure the templates don't define as wrong just because it is extra.

## Lens 2 — Drift

Find claims the repo contradicts. Check at least:

- every path the docs cite exists (trees, links, "lives in" columns);
- each version in `STACK.md` matches the manifest or lockfile (`package.json`, `pyproject.toml`, `go.mod`, …) — quote both values;
- a feature marked `planned` whose code exists, or `shipped` whose code doesn't;
- a scope-table row with no file behind it, and a scoped file with no row;
- commands in `AGENTS.md` that the manifests' scripts don't define.

Quote the doc line and the repo fact side by side, so the user can judge without opening files.

## Lens 3 — Content

Triage the `/doctor prompt-audit` reports against this project: keep the findings that hold here, drop the ones that don't, and say why for each dropped one. Two template rules win over a report: the `AGENTS.md` tree with `(planned)` paths stays, and a rule's "never" or "must" is never cut. Your own judgment covers only what the reports don't, such as a doc that contradicts `CONVENTIONS.md`, or two docs stating different values for one fact.

## Report, then one batch

Deliver one report, numbered so the user can approve part of it:

| # | Lens | Finding | Proposed change | Why |
|---|---|---|---|---|

Then stop and ask which items to apply. **Write nothing until the user approves**; partial approval is fine ("apply 1–4 and 7"). Apply the approved items as one batch of edits, then report the files changed and the new line count of each imported file.

**Splitting PITFALLS.** When the split is approved, move every entry's full text verbatim into `docs/PITFALLS-HISTORY.md`, under the same headings. This new file is the one file you may create. Then rewrite each entry in `PITFALLS.md` as its heading, its rule in 1–3 lines and a link to its history anchor. Check each rule against its story before saving: every "never", "must", limit and exact value in the story stays in the rule. A rule that loses its constraint is wrong.

Do not commit unless the user asks.

## Boundaries

- Never edit `docs/MODEL-NOTES.md` and never propose model tuning; both belong to `update-for-model`.
- Don't scaffold other missing living docs. Report them and point at `project-initializer`, which creates only the files that are missing.
- Leave `OPERATING-MODEL.md`, `.claude/agents/` and any model or effort rules alone; those belong to `agent-operating-model`.
