---
type: regex
pattern: '@docs/(ARCHITECTURE|FEATURES|PRD|ROADMAP|STACK|SUMMARY)'
match: not_contains
target: { source: file, path: CLAUDE.md }
---
