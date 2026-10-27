#!/usr/bin/env bash
set -euo pipefail

cat > package.json <<'EOF'
{ "name": "dash", "version": "1.0.0", "dependencies": { "react": "19.3.1", "react-dom": "19.3.1" } }
EOF
mkdir -p docs src
echo 'export const App = () => null;' > src/App.jsx
cat > CLAUDE.md <<'EOF'
# CLAUDE.md

**Primary reference:** See @AGENTS.md for the complete guide.

## Living documentation

- @AGENTS.md
- @docs/CONVENTIONS.md
- @docs/PITFALLS.md
- [docs/STACK.md](docs/STACK.md)
- [docs/SUMMARY.md](docs/SUMMARY.md)
EOF
cat > AGENTS.md <<'EOF'
# AGENTS.md

Guide for agents working on **dash**, a React dashboard.

## Development workflow

npm install, then npm run dev.
EOF
printf '# Conventions\n\nUse function components only.\n' > docs/CONVENTIONS.md
printf '# Pitfalls\n\nNone yet.\n' > docs/PITFALLS.md
printf '# Summary\n\ndash is a React dashboard for sales numbers.\n' > docs/SUMMARY.md
cat > docs/STACK.md <<'EOF'
# Stack

| Package | Version | Why |
|---|---|---|
| react | 18.2.0 | UI |
| react-dom | 18.2.0 | DOM renderer |
EOF
