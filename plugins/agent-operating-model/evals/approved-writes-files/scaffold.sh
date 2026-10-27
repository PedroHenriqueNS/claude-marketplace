#!/usr/bin/env bash
# Same fixture as monorepo-proposes-leads (no CLAUDE.md); history.jsonl was recorded on it.
set -euo pipefail
bash "$(dirname "$0")/../monorepo-proposes-leads/scaffold.sh"
