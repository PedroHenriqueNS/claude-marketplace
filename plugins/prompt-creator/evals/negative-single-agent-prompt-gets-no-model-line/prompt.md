---
description: A single-agent one-shot task. Naming any model or effort level is a failure, even a sensible one.
tags: [online]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, WebFetch]
---

Rewrite my prompt: "add a --dry-run flag to scripts/deploy.sh — done means ./scripts/deploy.sh --dry-run prints the plan and exits 0, and the real deploy path must not change"
