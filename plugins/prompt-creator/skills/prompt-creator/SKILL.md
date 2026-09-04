---
name: prompt-creator
description: >-
  Use when the user wants a prompt they intend to give Claude Code rewritten or
  improved BEFORE running it — "improve this prompt", "rewrite my prompt", "make
  this prompt better", "help me write a good prompt for this task", "turn this
  into a proper prompt", or /prompt-creator followed by a rough prompt. Also use
  for a feature too big for one prompt, when they want the right opening prompt
  for it. Do NOT trigger to execute the task the prompt describes, and
  NOT for authoring system prompts or prompt engineering for the user's own LLM
  applications (that is Claude API territory) — only for improving prompts aimed
  at Claude Code itself.
---

# Prompt Creator

Rewrite a rough prompt the user intends to give Claude Code so it follows current official best practices. The deliverable is the improved prompt, not the execution of the task it describes.

## Procedure

1. **Fetch fresh guidance — every invocation, never skip.** Fetch <https://code.claude.com/docs/en/best-practices> and extract its prompt-writing rules; it is the authoritative rubric. If the fetch fails or returns anything that isn't that page (offline, moved, no web tool), fall back to [`references/best-practices-checklist.md`](./references/best-practices-checklist.md) and tell the user the guidance may be stale.

2. **Name the request's shape, out loud.** Say it in one line so the user can correct it; it selects which rules bear hardest, never which to skip.
   - **One-shot task** — a scoped change. The default.
   - **Bug** — needs symptom, likely location, and what "fixed" looks like.
   - **Large feature** — too big for one prompt. The deliverable is still a prompt: the guidance's interview kickoff, adapted to this feature. Never hand the job back.
   - **Exploratory** — leave it open. Vague is sometimes right; don't force scope onto it.
   - **Unattended run** — the user will walk away. A gating check outranks everything else.

3. **Diagnose against the rubric.** If the rewrite depends on something genuinely ambiguous — scope, what "done" looks like, how to verify — ask before rewriting. Ask one thing at a time, as multiple choice whenever the options are knowable. While any part is unclear, do not rewrite the clear parts — a half-rewrite invites the user to accept it as finished. A large feature is exempt: its unknowns are what the interview prompt exists to surface. Never guess, and never pad the rewrite with invented requirements.

4. **Rewrite** applying every applicable rule from the guidance step 1 actually produced — the live page, or the fallback if it failed. That is the rubric; never a version recalled from memory.

5. **Deliver.** Output, in this order:
   - The rewritten prompt in a fenced code block, copy-paste ready.
   - One line naming the guidance used: live URL and fetch date, or the fallback plus its staleness warning.
   - A bulleted **what changed & why**, each naming the rule it applies.
   - Offer to run it now or in a fresh session — recommend fresh when context is already long.
