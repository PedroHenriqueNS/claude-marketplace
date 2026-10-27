#!/usr/bin/env bash
# One Node app, no CI, no infra, no non-code folders: one justified area.
set -euo pipefail
mkdir -p src/routes src/lib test
cat > package.json <<'J'
{ "name": "todo-api", "version": "1.0.0", "type": "module",
  "scripts": { "start": "node src/server.js", "test": "node --test" },
  "dependencies": { "express": "^4.19.2" } }
J
cat > src/server.js <<'J'
import express from "express";
import { todos } from "./routes/todos.js";
const app = express();
app.use(express.json());
app.use("/todos", todos);
app.listen(3000);
J
cat > src/routes/todos.js <<'J'
import { Router } from "express";
import { store } from "../lib/store.js";
export const todos = Router();
todos.get("/", (_req, res) => res.json(store.list()));
todos.post("/", (req, res) => res.status(201).json(store.add(req.body.title)));
J
cat > src/lib/store.js <<'J'
const items = [];
export const store = {
  list: () => items,
  add: (title) => { const t = { id: items.length + 1, title, done: false }; items.push(t); return t; },
};
J
cat > test/store.test.js <<'J'
import test from "node:test";
import assert from "node:assert";
import { store } from "../src/lib/store.js";
test("adds a todo", () => assert.equal(store.add("x").title, "x"));
J
printf '# todo-api\n\nA small in-memory todo API.\n' > README.md
git init -q && git add -A && git -c user.name=fixture -c user.email=fixture@example.com commit -qm "init"
