# Stack

Deliberately minimal. There is no language runtime, package manager, or build system — the "stack" is the Claude Code plugin spec plus the formats its manifests use.

## What we use

| Thing | Role | Notes |
|---|---|---|
| **Markdown** | Skill content (`SKILL.md`), references, templates, all docs | The primary "source code". Skills are prompts/instructions, not compiled artifacts. |
| **JSON** | Manifests (`marketplace.json`, `plugin.json`), evals (`evals.json`) | Shape is dictated by the Claude Code plugin spec. |
| **Claude Code CLI** | The runtime + the validator | `claude plugin validate` is the only "build/test" gate. |
| **Git** | Versioning + distribution | Remote install resolves a GitHub `owner/repo`; local install resolves a path. |
| **`.gitattributes` `text=auto`** | Line-ending normalization | Repo stores LF; checkout is native per platform. Matters because content was authored on Windows (`C:/Users/...`) and Unix. |

## What we deliberately do NOT use

- No `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod` — there is no compiled or interpreted code to manage.
- No bundler, transpiler, linter, or test framework — `claude plugin validate` covers correctness; prose quality is reviewed by hand.
- No CI yet (see [ROADMAP.md](./ROADMAP.md)).
- No external services, databases, or message brokers.

## Manifest reference (what the spec requires of us)

- **`marketplace.json`** — `name`, `owner`, and `plugins[]`. Each plugin entry: `name`, `source` (relative path `./plugins/<name>`), `version`, `description`, `author`.
- **`plugin.json`** — `name`, `version`, `description`, `author`, optional `keywords`.
- **`SKILL.md`** — YAML frontmatter (`name`, `description`) then the skill body. `description` is what drives triggering — see [CONVENTIONS.md](./CONVENTIONS.md).

## Versions

Each plugin currently sits at **`0.1.0`** in both its `plugin.json` and `marketplace.json` entry. The Claude Code plugin spec version is whatever the installed `claude` CLI supports — there's no pin in this repo.

> TODO: Pin a minimum supported `claude` CLI version here if remote consumers ever report spec-compatibility issues.

## Authoritative source for the spec

The plugin/marketplace manifest formats are owned by Claude Code, not this repo: <https://code.claude.com/docs/en/plugin-marketplaces>. When the spec and this doc disagree, the spec wins — update this file.
