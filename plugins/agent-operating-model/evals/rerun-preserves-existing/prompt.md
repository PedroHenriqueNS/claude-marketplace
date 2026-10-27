---
description: A project that already has .claude/agents/ and an OPERATING-MODEL.md triggers update mode. The skill classifies agents (keep, adjust, new, unused) and proposes only the delta, without touching the existing files.
tags: [positive]
max_turns: 40
timeout_seconds: 900
allowed_tools: [Skill, Read, Glob, Grep]
---

Set up the agent operating model for this project again — it already has one, so tell me what you'd keep and what you'd change. Context so you don't need to ask: I'm the sole owner of this repo, there are no planned areas beyond what's already in it, and nothing gets pushed to main, published or paid for without me.
