#!/usr/bin/env bash
# Two apps, a shared package, CI, infra, auth data and a marketing folder; no CLAUDE.md.
# Also used by approved-writes-files.
set -euo pipefail
mkdir -p apps/web/app apps/api/src/auth apps/api/src/users packages/ui/src infra/terraform .github/workflows marketing docs
cat > package.json <<'J'
{ "name": "shopline", "private": true, "workspaces": ["apps/*", "packages/*"] }
J
cat > pnpm-workspace.yaml <<'J'
packages:
  - "apps/*"
  - "packages/*"
J
cat > apps/web/package.json <<'J'
{ "name": "@shopline/web", "dependencies": { "next": "^15.0.0", "react": "^19.0.0", "@shopline/ui": "workspace:*" } }
J
cat > apps/web/app/page.tsx <<'J'
import { Button } from "@shopline/ui";
export default function Home() { return <main><h1>Shopline</h1><Button>Shop now</Button></main>; }
J
cat > apps/api/package.json <<'J'
{ "name": "@shopline/api", "dependencies": { "fastify": "^5.0.0", "jsonwebtoken": "^9.0.2", "pg": "^8.12.0", "stripe": "^16.0.0" } }
J
cat > apps/api/src/server.ts <<'J'
import Fastify from "fastify";
import { login } from "./auth/login";
import { createUser } from "./users/create";
const app = Fastify();
app.post("/login", login);
app.post("/users", createUser);
app.listen({ port: 4000 });
J
cat > apps/api/src/auth/login.ts <<'J'
import jwt from "jsonwebtoken";
export async function login(req: any) { return { token: jwt.sign({ sub: req.body.email }, process.env.JWT_SECRET!) }; }
J
cat > apps/api/src/users/create.ts <<'J'
// Stores name, email and shipping address (personal data).
export async function createUser(req: any) { return { id: 1, ...req.body }; }
J
cat > packages/ui/package.json <<'J'
{ "name": "@shopline/ui", "dependencies": { "react": "^19.0.0" } }
J
cat > packages/ui/src/index.tsx <<'J'
export const Button = (p: { children: string }) => <button>{p.children}</button>;
J
cat > infra/terraform/main.tf <<'J'
resource "aws_db_instance" "main" { engine = "postgres" instance_class = "db.t4g.micro" }
J
cat > .github/workflows/ci.yml <<'J'
name: ci
on: [push]
jobs:
  test: { runs-on: ubuntu-latest, steps: [ { uses: actions/checkout@v4 }, { run: pnpm install && pnpm test } ] }
J
printf '# Launch plan\n\nBlog posts and a newsletter for the spring launch.\n' > marketing/launch-plan.md
printf '# Roadmap\n\n- Checkout with Stripe\n- Spring launch campaign\n' > docs/ROADMAP.md
printf '# Shopline\n\nA small storefront: Next.js web app, Fastify API, Terraform infra.\n' > README.md
git init -q && git add -A && git -c user.name=fixture -c user.email=fixture@example.com commit -qm "init"
