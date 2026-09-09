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

Rewrite a rough prompt the user intends to give Claude Code so it follows official best practices. The deliverable is the improved prompt, not the task it describes.

## Procedure

1. **Fetch fresh guidance — every invocation, never from memory.** Fetch <https://code.claude.com/docs/en/best-practices> (the rubric), plus <https://code.claude.com/docs/en/model-config> and <https://code.claude.com/docs/en/sub-agents> for model and effort selection. A failed or wrong-page fetch falls back to its bundled reference — [`best-practices-checklist.md`](./references/best-practices-checklist.md), [`model-selection.md`](./references/model-selection.md) — and warn it may be stale.

2. **Name the request's shape.** One line, so the user can correct it; it selects which rules bear hardest, never which to skip.
   - **One-shot task** — a scoped change. The default.
   - **Bug** — needs symptom, likely location, and what "fixed" looks like.
   - **Large feature** — too big for one prompt. The deliverable is still a prompt: the guidance's interview kickoff adapted to it. Never hand the job back.
   - **Exploratory** — leave it open; vague is sometimes right.
   - **Unattended run** — the user walks away; a gating check outranks everything.

3. **Diagnose against the rubric.** If the rewrite depends on something genuinely ambiguous — scope, what "done" looks like, how to verify — ask first: one thing at a time, multiple choice where options are knowable. Don't rewrite the clear parts while anything is unclear; a half-rewrite reads as finished. A large feature is exempt: the interview prompt exists to surface its unknowns. Never guess or pad with invented requirements.

4. **Assign models — only when the rewrite dispatches work.** Skip unless it spawns subagents, parallel agents, or a workflow; a single-agent prompt gets no model line. Otherwise name a model, and effort where it matters, per agent with one clause of why: cheap tier for mechanical breadth, top tier for judgment. Unassigned agents inherit the session's model — the failure this prevents.

5. **Rewrite** applying every applicable rule from step 1's guidance.

6. **Deliver**, in this order:
   - The rewritten prompt in a fenced code block, copy-paste ready.
   - One line naming the guidance used: each live URL with its fetch date, or each fallback and its staleness warning.
   - A bulleted **what changed & why**, each naming its rule, any model assignments included.
   - Offer to run it now or in a fresh session, recommending fresh when context is long.
