#!/usr/bin/env bash
# One API app with an existing operating model whose owner chose agent files without
# a model/effort floor; both agents are still justified.
set -euo pipefail
mkdir -p src tests .claude/agents docs
cat > package.json <<'J'
{ "name": "notes-api", "dependencies": { "fastify": "^5.0.0", "pg": "^8.12.0" }, "devDependencies": { "vitest": "^2.0.0" } }
J
printf 'import Fastify from "fastify";\nconst app = Fastify();\napp.get("/notes", async () => []);\napp.listen({ port: 4000 });\n' > src/server.ts
printf 'import { test } from "vitest";\ntest("notes", () => {});\n' > tests/notes.test.ts
cat > .claude/agents/specialist-api.md <<'J'
---
name: specialist-api
description: "API specialist. Use for routes and data access in src/."
---

You are the API specialist. You implement routes in src/ and report back.
J
cat > .claude/agents/specialist-review.md <<'J'
---
name: specialist-review
description: "Read-only reviewer. Use to review changes in src/ and tests/."
disallowedTools: Edit, Write, NotebookEdit
---

You are the reviewer. You review diffs and return a verdict per requirement.
J
cat > docs/OPERATING-MODEL.md <<'J'
# notes-api — Operating model

The main session dispatches specialists directly. Agents: `specialist-api`, `specialist-review`.

## Models and effort

Agent files carry no fixed model or effort: the spawner chooses both on every spawn (owner decision, 2026-10-16). Reports end with a questions block.
J
git init -q && git add -A && git -c user.name=fixture -c user.email=fixture@example.com commit -qm "init"
