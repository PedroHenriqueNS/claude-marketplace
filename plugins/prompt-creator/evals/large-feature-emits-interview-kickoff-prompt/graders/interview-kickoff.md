---
type: llm
---

PASS if all of these hold: (1) the reply names the request as a large feature; (2) it delivers a prompt in a fenced code block that has Claude interview the user about this billing system (for example with AskUserQuestion) and write a complete spec to SPEC.md; (3) it tells the user to execute that spec in a fresh session; (4) the delivered prompt names no model and no effort level.

FAIL if the reply declines, hands back a plan or workflow advice instead of a prompt, or any of those is missing.
