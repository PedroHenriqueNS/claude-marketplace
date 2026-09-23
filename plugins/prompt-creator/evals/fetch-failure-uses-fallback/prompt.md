---
description: Run WITHOUT granting WebFetch (tag offline), so every fetch fails. The skill must fall back to its bundled references, warn they may be stale, and still ask before rewriting an ambiguous prompt.
tags: [offline]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep]
---

Make this prompt better: "refactor the payment service, it's getting messy"
