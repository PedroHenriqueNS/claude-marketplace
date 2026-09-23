---
type: llm
---

PASS if all of these hold: (1) the reply names the request's shape as a bug; (2) it asks the user one clarifying question about something the prompt is missing — the symptom users see, where the login code lives, or how to confirm the fix — and asks only one such question in this reply (multiple-choice options are fine); (3) it does not yet present a finished rewritten prompt.

FAIL if any of those is missing, if the reply starts diagnosing or fixing a login bug itself, or if it invents requirements the user never gave.
