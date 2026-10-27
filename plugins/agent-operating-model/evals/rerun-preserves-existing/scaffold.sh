#!/usr/bin/env bash
# One API app with an existing operating model: one agent still justified (with a
# sentinel rule from a past review), one for a mobile app that no longer exists.
set -euo pipefail
mkdir -p src .claude/agents docs
cat > package.json <<'J'
{ "name": "notes-api", "dependencies": { "fastify": "^5.0.0", "pg": "^8.12.0" } }
J
printf 'import Fastify from "fastify";\nconst app = Fastify();\napp.get("/notes", async () => []);\napp.listen({ port: 4000 });\n' > src/server.ts
cat > .claude/agents/specialist-api.md <<'J'
---
name: specialist-api
description: "API specialist. Use for routes and data access in src/."
model: opus
effort: medium
---

You are the API specialist. You implement routes in src/ and report back.

## Rules

- SENTINEL: every route returns a typed error body (agent review 2026-09-01, item 3). Keep this rule.
J
cat > .claude/agents/specialist-mobile.md <<'J'
---
name: specialist-mobile
description: "Mobile specialist. Use for the React Native app in mobile/."
model: sonnet
effort: medium
---

You are the mobile specialist. You build screens in mobile/ and report back.
J
cat > docs/OPERATING-MODEL.md <<'J'
# notes-api — Operating model

The main session dispatches specialists directly. Agents: `specialist-api`, `specialist-mobile`.
Every spawn sets model and effort explicitly. Reports end with a questions block.
J
git init -q && git add -A && git -c user.name=fixture -c user.email=fixture@example.com commit -qm "init"
