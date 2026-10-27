# Template: `CLAUDE.md`

Claude Code's entry point. It stays lean and defers to `AGENTS.md`.

Format rules:

- Write the block below verbatim, filling the bracketed note. The one line to drop is `docs/EVENTS.md`, unless the project is events-active; when it is, the line stays a link.
- The "Living documentation" list imports only the core: `AGENTS.md`, `docs/CONVENTIONS.md` and `docs/PITFALLS.md`. Claude Code expands every import at launch, in full, in every session, so every other living doc is a plain Markdown link on the same list.
- The sentence above the list says why. Keep it as visible Markdown: HTML comments are stripped before the file reaches Claude.
- `docs/MODEL-NOTES.md` is never written at init time; `update-for-model` adds it to the core imports later.
- Imports added by other tools or plugins are theirs; leave them as they are.

````markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Primary reference:** See @AGENTS.md for the complete guide — project overview, hard constraints, stack, workflows, conventions, and pitfalls.

## Claude-specific notes

[Any Claude Code-specific preferences, tool usage patterns, or behaviors that don't belong in AGENTS.md. Leave empty with a TODO if nothing specific yet.]

## Living documentation

Keep these files current as the project evolves. Only the first three are imported, because an import loads the whole file into every session at launch; open the linked ones when a task needs them.

- @AGENTS.md
- @docs/CONVENTIONS.md
- @docs/PITFALLS.md
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/EVENTS.md](docs/EVENTS.md)
- [docs/FEATURES.md](docs/FEATURES.md)
- [docs/PRD.md](docs/PRD.md)
- [docs/ROADMAP.md](docs/ROADMAP.md)
- [docs/STACK.md](docs/STACK.md)
- [docs/SUMMARY.md](docs/SUMMARY.md)

Update relevant docs whenever making changes that affect architecture, features, stack, conventions, or reveal new pitfalls.
````
