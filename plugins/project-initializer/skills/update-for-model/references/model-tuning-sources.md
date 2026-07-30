# Where model tuning guidance lives, and what to pull from it

> URL map verified against Anthropic's live docs on 2026-07-30. This file is a **method, not a snapshot** — it deliberately records *where to look* and *what to look for*, never a frozen copy of any model's behavior. A snapshot of per-model specifics would rot on the next model launch, which is exactly the failure this skill exists to prevent. If you are reading this because a live fetch failed, tell the user the guidance may be stale.

## The URL map

Fetch the hubs; let them route you to the model. Only the hubs are pinned here — per-model pages are discovered, not hardcoded, so a model released after this file was written is still found.

| # | Page | URL | What it gives you |
|---|---|---|---|
| 1 | Models overview | `https://docs.claude.com/en/docs/about-claude/models/overview` | The live model menu for step 1 — names, API IDs, extended-thinking support, context window, knowledge cutoff, pricing. Use it to offer choices and to confirm the user's model exists. |
| 2 | Prompting best practices (hub) | `https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices` | Model-agnostic prompting baseline **and** the index of per-model pages. Follow its link for the chosen model. |
| 3 | Per-model prompting page | `…/prompt-engineering/prompting-claude-<model-slug>` | **The payload.** Each page documents that model's behavioral differences from its predecessor and the prompt/scaffolding changes worth making. Slug is the model name lowercased with dots and spaces as dashes (`Claude Opus 4.8` → `prompting-claude-opus-4-8`). Reach it via the hub link; construct the slug only if the hub link is unavailable. |
| 4 | Migration guide | `https://docs.claude.com/en/docs/about-claude/models/migration-guide` | What breaks coming *from* the project's previous model — deprecated parameters, changed defaults. Has per-pair anchors. |
| 5 | Claude Code model config | `https://code.claude.com/docs/en/model-config` | Harness side: how the model is actually selected, aliases, effort/thinking settings, env vars. This is what belongs in the project's Harness settings section. |

Not every model has page 3 — older or smaller models may only appear in pages 1, 2, and 4. That is not an error; note it and work from what exists.

## Extraction checklist

Pull only items that **differ for this model** *and* **change what a contributor should write in this project's docs**. For each, capture the behavior and the concrete adjustment. If the docs don't mention one, skip it — never infer.

1. **Response length and verbosity defaults** — does it run long or terse by default, and what dials it?
2. **Effort / thinking configuration** — adaptive vs. manual budgets, effort levels, which parameters are supported or removed.
3. **Instruction-following literalness** — does it follow instructions more literally, so hedged or aspirational wording now under-delivers?
4. **Tool and skill trigger sensitivity** — more or less eager to invoke tools/skills. Aggressive "ALWAYS USE THIS" language tuned for an older model often *over*-triggers on a newer one; that is a doc edit.
5. **Proactivity defaults** — does it act by default or research first, and how is that steered?
6. **Progress claims and self-correction on long runs** — reliability of "done" claims, which changes how hard the project's verification rules must push for evidence.
7. **Subagent and parallelism control** — how it delegates, and what to say to control that.
8. **Deprecated or removed parameters** — e.g. prefilled assistant turns, manual thinking budgets. These are hard breaks, not preferences.
9. **Context window and knowledge cutoff** — a larger window may relax a "keep files small" rule; a cutoff shifts what must be fetched rather than recalled.
10. **Frontend/design or other domain defaults** — only if the project has that surface.

## Turning the delta into edits

- Something that changes **how to prompt or harness** in this project → `docs/MODEL-NOTES.md`.
- Something that changes **an existing rule** in `AGENTS.md`, `docs/CONVENTIONS.md`, or `docs/PITFALLS.md` → edit that file to link MODEL-NOTES.md, keep the detail in MODEL-NOTES.md.
- Something true of **all** Claude models → not a model note. Leave it out.
