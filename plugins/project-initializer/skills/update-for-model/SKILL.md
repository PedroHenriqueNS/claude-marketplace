---
name: update-for-model
description: >-
  Use when the user explicitly asks to re-tune an existing project's living
  agent documentation for one specific Claude model — "update the docs for Opus
  5", "tune AGENTS.md for Sonnet 5", "we're moving to <model>, update the living
  docs", "re-tune the docs for a different model", or /update-for-model. Fetches
  Anthropic's live docs for the chosen model and writes docs/MODEL-NOTES.md,
  editing AGENTS.md / CLAUDE.md / docs/* in place only where that model
  genuinely changes the guidance. Anthropic Claude models only. Do NOT trigger
  to change which model the session is running (that is /model), to scaffold
  docs that do not exist yet (that is project-initializer), or to improve a
  single prompt (that is prompt-creator).
---

# Update For Model

Re-tune a project's living agent documentation for **one** Claude model the user picks. The deliverable is `docs/MODEL-NOTES.md` plus a small set of in-place edits that point at it.

**Anthropic Claude models only.** This skill has no guidance for OpenAI, Gemini, Llama, or any other vendor's models — if asked for one, say so and stop.

## Procedure

1. **Ask which model to target — always, and first.** Fetch <https://docs.claude.com/en/docs/about-claude/models/overview>, then offer the models that page actually lists (free text is fine too). **Never infer the target from the model running this session**, and never rely on a model list memorized from training — the lineup changes and stale lists are the failure this skill exists to prevent. If that fetch fails, do not fall back to a remembered lineup: ask the user to name the model and its API ID, tell them you could not verify it exists, and carry that warning into the report and into MODEL-NOTES.md.

2. **Fetch that model's guidance — every invocation, never skip.** Read [`references/model-tuning-sources.md`](./references/model-tuning-sources.md) for the URL map and the extraction checklist, then fetch: the prompting-best-practices hub and follow its link to the chosen model's own page (`prompting-claude-<model-slug>`), the migration guide, and the Claude Code model-config page. If a fetch fails (offline, page moved, no web tool), continue from the reference file alone and **tell the user the guidance may be stale** — never silently substitute memory for the live docs.

3. **Extract only the delta.** Keep what the fetched pages state differs for this model — versus its predecessor, and versus a sibling where they say so — *and* that changes how an agent should be prompted or harnessed here. A sibling comparison must come from what a page actually states; never assemble one by inference. Discard advice that is true of every Claude model — that belongs in the project's normal docs, not in model notes. If the live pages say nothing that changes this project's guidance, say so and write a short MODEL-NOTES.md rather than padding it.

4. **Survey before editing.** Read whichever of `AGENTS.md`, `CLAUDE.md`, and `docs/{SUMMARY,PRD,ARCHITECTURE,FEATURES,STACK,CONVENTIONS,PITFALLS,ROADMAP}.md` exist. The tuning must fit the project's actual workflow, stack, and conventions — generic model notes help nobody.

5. **Draft `docs/MODEL-NOTES.md`** following [`templates/model-notes.md`](./templates/model-notes.md) — draft it, don't write it yet. Record the fetch date and source URLs in it so staleness is visible later. If the file already exists for a different model, this draft **replaces it wholesale** — one file, one answer to "what model is this repo tuned for" — so say which model it currently targets and what the replacement changes.

6. **Propose everything in one batch, then write on approval.** Show the whole change first — the MODEL-NOTES.md draft (flagged as new or as replacing model X) and every in-place edit, each with what changes and why that model requires it. **Write nothing until the user approves**; MODEL-NOTES.md is written in the same approved batch as the edits that reference it, so it can never land orphaned. Two edits are always proposed:
   - `CLAUDE.md` → add `@docs/MODEL-NOTES.md` to the Living documentation list.
   - `AGENTS.md` → add a Documentation maintenance line: switching target model → update `docs/MODEL-NOTES.md`.

   Every other edit is conditional (candidates: `AGENTS.md` workflow/testing, `docs/CONVENTIONS.md`, `docs/PITFALLS.md`) and **links to MODEL-NOTES.md rather than inlining the detail** — the depth lives in one file.

   If a target file or section doesn't exist, **do not create it** — scaffolding is `project-initializer`'s job. Propose the nearest equivalent anchor, or report that MODEL-NOTES.md will be unreferenced and why. When replacing an earlier model's notes, also re-check the in-place edits made for that model and propose updating or reverting any whose wording was tuned to it.

7. **Report:** the model targeted, the file written (new, or replacing model X with the delta), the edits applied, the sources and fetch date, and a staleness warning if any fetch failed.

## Rules

- **Explicit invocation only** — never auto-run because a project's docs look untuned.
- **Ask, never assume, the model** — the session's own model is not the answer.
- **Live fetch every time**, with the reference file as fallback and a stated staleness warning.
- **Delta only** — model-agnostic advice does not belong in MODEL-NOTES.md.
- **Detail in one place** — in-place edits link, they don't inline.
- **Approval before writing anything** — MODEL-NOTES.md and the in-place edits land together, after one approval. This skill rewrites source-of-truth docs.
- **This skill replaces `docs/MODEL-NOTES.md`; the sibling never overwrites.** `project-initializer`'s "existing files are sacred" rule governs *scaffolding* — creating docs that don't exist. MODEL-NOTES.md is this skill's own output, and a repo has exactly one target model, so re-tuning replaces it rather than appending. Every other file is still edited in place, never replaced.
- **Never invent behavior** a model page doesn't document. An empty section beats a plausible guess.
