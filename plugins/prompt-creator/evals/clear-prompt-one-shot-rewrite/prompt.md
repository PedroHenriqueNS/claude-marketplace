---
description: Scope, verification, and a non-goal are all present, so the skill rewrites in one shot without questions and assigns no models.
tags: [online]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, WebFetch]
---

Rewrite my prompt: "add tests for src/utils/date.ts — we use Vitest, I care about DST edge cases, done means npm test passes, don't touch the implementation"
