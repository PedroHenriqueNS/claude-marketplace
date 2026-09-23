---
type: llm
---

PASS if all of these hold: (1) the reply names the request's shape as a one-shot task; (2) it asks the user no clarifying question about the task before rewriting (a closing offer to run the prompt now or in a fresh session is not such a question); (3) it delivers the rewritten prompt in a fenced code block that keeps tests for src/utils/date.ts in Vitest, the DST edge cases, `npm test` passing as the done check, and the rule not to touch the implementation; (4) a line after the block names the guidance used, with its URL or URLs and a date; (5) a list explains what changed and why; (6) no model and no effort level is assigned to anything (saying that no model assignment is needed is fine).

FAIL if any of those is missing.
