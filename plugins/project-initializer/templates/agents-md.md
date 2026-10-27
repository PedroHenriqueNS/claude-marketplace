# Template: `AGENTS.md`

Primary source of truth for any AI agent working on the project. `CLAUDE.md` imports it, so it stays under 200 lines (see [conventions.md](conventions.md) › Living docs size).

Format rules:

- **Sections, in this order:** project overview (one paragraph); `## Hard constraints`; tech stack summary (link to `docs/STACK.md`); repository structure; development workflow (install, run, test, lint commands); coding conventions (link to `docs/CONVENTIONS.md`); commit and PR conventions; testing expectations; known pitfalls (link to `docs/PITFALLS.md`); `## Documentation maintenance`.
- **Hard constraints** come right after the overview: a short numbered list of the rules that override every other consideration. Take the items from the survey or the user's answers, never invent them. There is no fixed count. When none are known, the section holds a TODO.
- **Repository tree:** an ASCII tree of the key directories. Mark paths that are planned but not yet on disk `(planned)`. The tree is not derivable from the code, so keep it even when a review such as `/doctor` proposes cutting directory layouts.
- **Documentation maintenance** is written verbatim from the block below. It is the only copy of the map; `docs/CONVENTIONS.md` links to it. When the project is events-active, the events template appends its `docs/EVENTS.md` line to it.

````markdown
# AGENTS.md

Primary source of truth for any AI agent (or human) working on **<Project Name>**. Read this first, then the linked docs.

## Project overview

<One paragraph: what the project is, who it serves, its current state.>

## Hard constraints

These rules override every other consideration, including speed and convenience:

1. <A rule from the survey or the user's answers — one numbered item per rule. When none are known, replace this list with the TODO below.>

> TODO: List the rules that must never be broken (for example data that must never leave the region, or an API that must stay backward compatible).

## Tech stack

<Two or three lines.> Full detail: [docs/STACK.md](./docs/STACK.md).

## Repository structure

```
<repo>/
├── src/              # <what lives here>
└── <dir>/            # (planned) <what will live here>
```

## Development workflow

```
<install command>
<run command>
<test command>
<lint command>
```

## Coding conventions

The single source of truth is [docs/CONVENTIONS.md](./docs/CONVENTIONS.md).

## Commit and PR conventions

<Commit format, branch model, PR target.>

## Testing expectations

<Runner, layout, what must pass before a commit.>

## Known pitfalls

One rule per entry in [docs/PITFALLS.md](./docs/PITFALLS.md); the full stories are in [docs/PITFALLS-HISTORY.md](./docs/PITFALLS-HISTORY.md).

## Documentation maintenance

These files are living documents. When you make changes to this project, update the relevant docs in the same commit:

- Architectural change → update `docs/ARCHITECTURE.md`
- Architectural change that alters a flow depicted in a Mermaid diagram → update that diagram in the SAME commit (a stale diagram misleads agents because it looks authoritative). Diagram topology only; keep constraints in the prose beside it.
- Code built that was designed → update the status line in `docs/ARCHITECTURE.md`
- New feature or feature change → update `docs/FEATURES.md`
- New feature PRD → `docs/prds/<slug>.md`, registered in `docs/FEATURES.md` and `docs/ROADMAP.md`
- Discovered a gotcha → rule in `docs/PITFALLS.md`, story in `docs/PITFALLS-HISTORY.md`
- Stack change (new dep, version bump, service) → update `docs/STACK.md`
- Scope or requirements change → update `docs/PRD.md` and `docs/SUMMARY.md`
- New coding rule, banned shortcut, or workflow convention → add to `docs/CONVENTIONS.md` (THE source of truth — never bury rules in commit messages, AGENTS.md prose, or private notes)
- Phase reached or priorities shifted → update `docs/ROADMAP.md`
- Priorities or status changed → update the status line in `docs/SUMMARY.md`

If you skip a doc update, note why in the commit message.
````
