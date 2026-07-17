# AGENTS.md

Primary source of truth for any AI agent (or human) working on **claude-marketplace**. Read this first, then the linked docs.

## Project overview

`claude-marketplace` is a personal [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) — a single-repo catalog that owns and distributes nine Claude Code plugins. There is no application code, build step, or runtime: the project is Markdown skill content plus JSON manifests, made installable by `.claude-plugin/marketplace.json`. See [docs/SUMMARY.md](./docs/SUMMARY.md) for the 30-second version.

## Tech stack

Markdown (skill content + docs), JSON (manifests), validated by the Claude Code CLI. No package manager, bundler, or test framework. Full detail: [docs/STACK.md](./docs/STACK.md).

## Repository structure

```
.claude-plugin/marketplace.json   # catalog: name "pedrohenriquens", owner, 9 plugins
plugins/<name>/.claude-plugin/plugin.json   # one plugin's identity + version
plugins/<name>/skills/<skill>/SKILL.md      # the capability (+ optional references/ templates/ evals/)
docs/                             # living documentation (start at SUMMARY.md)
README.md · NOTICE · .gitignore · .gitattributes
```

The three manifest layers (marketplace → plugin → skill) and the install-time resolution flow are in [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

## Development workflow

There is nothing to install or run. The loop is: edit Markdown/JSON → validate → commit.

```
python3 scripts/check_compliance.py       # best-practices compliance gate (versions, frontmatter, links)
claude plugin validate .                  # validate the marketplace manifest
claude plugin validate ./plugins/<name>   # validate one plugin + its skills
```

- **Add a plugin:** create `plugins/<name>/.claude-plugin/plugin.json` + at least one `skills/<skill>/SKILL.md`, then add the matching entry to `marketplace.json` — in the **same** change.
- **Bump a version:** change it in BOTH `plugin.json` and the `marketplace.json` entry (they must match).
- **Install locally to test:** `/plugin marketplace add <path>` then `/plugin install <name>@pedrohenriquens`.

## Coding conventions

The single source of truth is [docs/CONVENTIONS.md](./docs/CONVENTIONS.md). Highlights:

- **All skills must follow Claude Code best practices** — distilled in [docs/CONVENTIONS.md › Claude Code best practices](./docs/CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows) (canonical source: <https://code.claude.com/docs/en/best-practices>). Lean `SKILL.md`, `description` written for triggering, progressive disclosure, don't restate what Claude already knows.
- JSON manifests: 2-space indent, double quotes, no trailing commas/comments. Match existing files.
- `SKILL.md`: YAML frontmatter (`name`, `description`); write `description` for *triggering*. Keep it lean; push depth into `references/`, output into `templates/`.
- Marketplace `name` must not start with `claude-`/`anthropic-` (reserved → we use `pedrohenriquens`).
- `source` paths are relative to repo root and must track folder names.

## Commit and PR conventions

[Conventional Commits](https://www.conventionalcommits.org/). Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Scope is the plugin name or `marketplace` (e.g. `feat(to-prd):`, `fix(marketplace):`). Trunk-based on `main`; branch for non-trivial work. Don't push to a remote or create a GitHub repo unless asked. Full rules: [docs/CONVENTIONS.md](./docs/CONVENTIONS.md#branching-and-pr-workflow).

## Testing expectations

No test framework. The gate is `python3 scripts/check_compliance.py` + `claude plugin validate` — run both after any manifest or skill change and ensure they pass before committing (CI runs the same in `.github/workflows/validate.yml`). Skills may carry `evals/evals.json`; update them when changing a skill's `description` or behavior. Deep best-practice review is the `skill-auditor` plugin, on demand.

## Known pitfalls

Reserved name prefixes, version-drift between the two manifests, relative `source` paths, derived-content licensing, and line endings — all documented with fixes in [docs/PITFALLS.md](./docs/PITFALLS.md). Read it before your first manifest change.

## Documentation maintenance

These files are living documents. When you make changes to this project, update the relevant docs in the same commit:

- Architectural change → update `docs/ARCHITECTURE.md`
- Architectural change that alters a flow depicted in a Mermaid diagram → update that diagram in the SAME commit (a stale diagram misleads agents because it looks authoritative). Diagram topology only; keep constraints in the prose beside it.
- New feature or feature change → update `docs/FEATURES.md`
- Discovered a gotcha → add to `docs/PITFALLS.md`
- Stack change (new dep, version bump, service) → update `docs/STACK.md`
- Scope or requirements change → update `docs/PRD.md` and `docs/SUMMARY.md`
- New coding rule, banned shortcut, or workflow convention → add to `docs/CONVENTIONS.md` (THE source of truth — never bury rules in commit messages, AGENTS.md prose, or private notes)
- Phase reached or priorities shifted → update `docs/ROADMAP.md`

If you skip a doc update, note why in the commit message.
