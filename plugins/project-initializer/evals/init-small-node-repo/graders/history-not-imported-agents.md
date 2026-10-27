---
type: regex
pattern: '@(\./)?(docs/)?PITFALLS-HISTORY'
match: not_contains
target: { source: file, path: AGENTS.md }
---
