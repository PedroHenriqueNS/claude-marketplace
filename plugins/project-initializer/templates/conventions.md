# Template: `docs/CONVENTIONS.md`

Canonical home for the project's coding rules. `CLAUDE.md` imports the root file, so it stays under 200 lines.

Format rules:

- The header (title through the first `---`) is written verbatim. Fill the other sections with stack-appropriate rules or the TODOs shown.
- **Documentation maintenance** is one line that links to the map in `AGENTS.md`. Never copy the map here.
- **Living docs size** is written verbatim; it is the project's size rule for every imported file.
- **Where conventions live:** in a monorepo, add one row per scoped file created, `| <Scope> | <dir>/docs/CONVENTIONS.md |`, using the scope directory exactly as the survey found it (`infra/` or `infrastructure/`). Keep the sentence after the table. Only the root file is imported; the scoped files are linked from this table.
- When the project is events-active, the events template appends its "## Event catalog" block.

````markdown
# <Project Name> — Conventions

Canonical home for project coding rules. Every rule that applies across the codebase lives here — naming, call-site patterns, error shapes, banned shortcuts, library choices, branching and PR workflow, anything else.

When a rule conflicts with what's in `AGENTS.md`, `CLAUDE.md`, the spec docs, or any inline comment, **this file wins**. The other files should be updated to match.

New conventions land HERE in the same PR that establishes them — never in commit messages, AI-assistant private notes, or buried inline comments.

---

## Languages and code style

> TODO: Document the project's language conventions (TypeScript strictness, Python type hints, Go style, etc.). Include any banned features (e.g. "no `any`", "no global state in services").

---

## Branching and PR workflow

> TODO: Document the branching model (trunk-based / GitFlow / roadmap-branch / etc.) and PR target rules.

---

## Conventional Commits

> TODO: List allowed types (feat / fix / chore / docs / refactor / test / etc.) and scopes for this project.

---

## Testing

> TODO: Document the test layout, runner, and minimum coverage expectations.

---

## Diagramming

> Mermaid only (plain text → agent-readable, diffable, renders for humans; never an exported image). Diagram a flow only when it has branching, ordering that matters, or 4+ non-obvious relationships AND is stable. Otherwise use prose, tables, or ASCII trees. Topology goes in the diagram; constraints ("idempotent", "never retry on 4xx") go in prose beside it. Derive strictly from code, cap ~7 nodes (split bigger flows), and update any diagram in the same commit as the code change it depicts.

---

## Living docs size

Each file that `CLAUDE.md` imports stays under 200 lines. That is Claude Code's target, and it counts every imported file on its own. Detail beyond that moves to a file nothing imports, linked from the imported one. If an imported file's short form still passes 200 lines, split it by topic into files that are not imported, and keep an index of them in the imported file. Claude Code's combined-size warning, at startup and in `/status`, is the check for the whole imported set.

---

## Documentation maintenance

The map of which change updates which doc lives in [AGENTS.md › Documentation maintenance](../AGENTS.md#documentation-maintenance). Follow it; do not copy it here.

---

## Where conventions live

| Scope | File |
|---|---|
| This file | Project-wide coding rules |
| Pitfall rules | `docs/PITFALLS.md` (full stories in `docs/PITFALLS-HISTORY.md`) |

A scope's file wins over this one for that scope when they conflict.

When establishing a new convention (in code review, brainstorming, direct user instruction), add it HERE in the same PR.
````

## Scoped files (monorepos)

Each scope's `<dir>/docs/CONVENTIONS.md` takes the same header with the scope named in the title. Directly under the header, say that its rules override the root file for that scope when they conflict, and link back to the root file (`/docs/CONVENTIONS.md`) and to sibling scopes so readers can navigate.

If a scope is pre-scaffold (the directory exists but holds no source yet), the file is still worth writing: it captures forward-looking rules so the first scaffold pass lands on the right conventions. End it with an "Open decisions for scaffold time" section listing the TBDs (package manager, styling library, test layout, …) that move into the body once decided.
