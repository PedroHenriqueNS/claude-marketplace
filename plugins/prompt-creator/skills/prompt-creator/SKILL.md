---
name: prompt-creator
description: >-
  Use when the user wants a prompt they intend to give Claude Code rewritten or
  improved BEFORE running it — "improve this prompt", "rewrite my prompt", "make
  this prompt better", "help me write a good prompt for this task", "turn this
  into a proper prompt", or /prompt-creator followed by a rough prompt. Fetches
  the live Claude Code best-practices doc on every invocation and rewrites the
  rough prompt against it. Do NOT trigger to execute the task the prompt
  describes, and NOT for authoring system prompts or prompt engineering for the
  user's own LLM applications (that is Claude API territory) — only for
  improving prompts aimed at Claude Code itself.
---

# Prompt Creator

Rewrite a rough prompt the user intends to give Claude Code into one that follows the current official best practices. The deliverable is the improved prompt — not the execution of the task it describes.

## Procedure

1. **Fetch fresh guidance — every invocation, never skip.** Fetch <https://code.claude.com/docs/en/best-practices> and extract its prompt-writing rules. The live page is the authoritative rubric. If the fetch fails for any reason (offline, page moved, no web tool available), fall back to [`references/best-practices-checklist.md`](./references/best-practices-checklist.md) and tell the user the guidance may be stale.

2. **Diagnose the rough prompt** against the rubric. If it is genuinely ambiguous on something the rewrite cannot proceed without — scope (which files/feature), what "done" or "fixed" looks like, or how to verify — ask 1–3 targeted questions first. Never guess and never pad the rewrite with invented requirements. Exception: if the prompt is deliberately exploratory ("what would you improve here?"), leave it open — vague is sometimes right.

3. **Rewrite** applying every applicable rule from the fetched guidance. The stable core (the live page refines it): scope the task precisely; point to sources and an exemplar pattern to follow; for bugs give symptom + likely location + what "fixed" looks like; include a check Claude can run and ask for evidence, not assertions; state what is out of scope or must not change; for non-trivial work instruct plan-first (explore → plan → code); one task per prompt.

4. **Deliver.** Output, in this order:
   - The rewritten prompt in a fenced code block, copy-paste ready.
   - A short bulleted **what changed & why**, each bullet naming the best-practice rule it applies.
   - The offer: run it now in this session, or paste it into a fresh one? Recommend a fresh session when the current context is already long — a clean session with a better prompt beats a cluttered one.
