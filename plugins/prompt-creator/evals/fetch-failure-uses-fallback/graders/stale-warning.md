---
type: llm
---

PASS if all of these hold: (1) the reply says the live guidance could not be fetched and that it is working from bundled fallback guidance that may be out of date; (2) it asks the user a clarifying question about the refactor — which files, what "better" should mean, or what must not break — before offering a finished rewrite.

FAIL if the reply claims it used the live pages, gives no staleness warning, or delivers a finished rewritten prompt without asking anything.
