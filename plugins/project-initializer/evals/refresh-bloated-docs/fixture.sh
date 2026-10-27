#!/usr/bin/env bash
set -euo pipefail

cat > package.json <<'EOF'
{ "name": "ledger", "version": "2.4.0", "dependencies": { "express": "4.21.2" } }
EOF
mkdir -p docs src
echo 'module.exports = {};' > src/app.js
cat > CLAUDE.md <<'EOF'
# CLAUDE.md

**Primary reference:** See @AGENTS.md for the complete guide.

## Living documentation

- @docs/ARCHITECTURE.md
- @docs/CONVENTIONS.md
- @docs/EVENTS.md
- @docs/FEATURES.md
- @docs/PITFALLS.md
- @docs/PRD.md
- @docs/ROADMAP.md
- @docs/STACK.md
- @docs/SUMMARY.md
EOF
cat > AGENTS.md <<'EOF'
# AGENTS.md

Guide for agents working on **ledger**, a bookkeeping API.

## Development workflow

npm install, then npm start.

## Documentation maintenance

- Discovered a gotcha → add to `docs/PITFALLS.md`
EOF
for doc in ARCHITECTURE CONVENTIONS EVENTS FEATURES PRD ROADMAP STACK SUMMARY; do
  printf '# %s\n\nTODO: fill in.\n' "$doc" > "docs/$doc.md"
done
{
  echo '# Pitfalls'
  echo
  for i in $(seq 1 20); do
    echo "## 2025-0$(( (i % 9) + 1 ))-1$(( i % 10 )) — Incident $i"
    echo
    echo "We hit a problem in the ledger export job, run $i. The nightly job read rows while a"
    echo "migration was still running, and totals came out wrong for a few accounts. It took a"
    echo "while to see, because the job logged success and only the reconciliation report showed"
    echo "the gap. We traced it to the job starting before the migration lock was released."
    echo
    echo "The fix was to wait for the lock. Since then the export must never start while a"
    echo "migration holds the lock, and a retry must wait at least $(( i * 5 )) seconds."
    echo
    echo "Related commits: abc$i, def$i. Discussed in the weekly sync; owner rotated twice."
    echo "We also considered moving the job to a replica, but replicas lag behind by minutes."
    echo "Severity: high. Detected by the reconciliation report, not by the job itself."
    echo "Follow-up: alerting on totals drift was added two weeks later."
    echo
  done
} > docs/PITFALLS.md
