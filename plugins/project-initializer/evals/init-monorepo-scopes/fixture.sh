#!/usr/bin/env bash
set -euo pipefail

cat > package.json <<'EOF'
{
  "name": "shop",
  "private": true,
  "workspaces": ["apps/*"]
}
EOF
mkdir -p apps/web apps/api infra
cat > apps/web/package.json <<'EOF'
{ "name": "@shop/web", "version": "0.1.0", "dependencies": { "next": "15.1.0", "react": "19.0.0" } }
EOF
cat > apps/api/package.json <<'EOF'
{ "name": "@shop/api", "version": "0.1.0", "dependencies": { "fastify": "5.2.0" } }
EOF
cat > infra/main.tf <<'EOF'
terraform {
  required_version = ">= 1.9"
}
EOF
printf '# shop\n\nAn online shop: a Next.js storefront, a Fastify API, and Terraform infrastructure.\n' > README.md
