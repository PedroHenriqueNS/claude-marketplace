# claude-marketplace — Conventions

Canonical home for project coding rules. Every rule that applies across the codebase lives here — naming, call-site patterns, error shapes, banned shortcuts, library choices, branching and PR workflow, anything else.

When a rule conflicts with what's in `AGENTS.md`, `CLAUDE.md`, the spec docs, or any inline comment, **this file wins**. The other files should be updated to match.

New conventions land HERE in the same PR that establishes them — never in commit messages, AI-assistant private notes, or buried inline comments.

---

## Claude Code best practices (the baseline every skill follows)

**All skills and plugins in this repo MUST follow Claude Code best practices.** Canonical source: <https://code.claude.com/docs/en/best-practices>. When that page and this section disagree, update this section to match it (this file still wins over `AGENTS.md`/`CLAUDE.md`, but it tracks upstream).

Everything below flows from the page's one core constraint: **Claude's context window fills up fast and performance degrades as it fills.** Skills here are written to spend that budget well — a bloated `SKILL.md` costs every session that loads it.

### Authoring skills and plugins

- **Lean `SKILL.md`, progressive disclosure.** Keep the skill body focused on *what to do*; push deep reference material into `references/` and reusable output into `templates/`. Don't inline what a sibling file can hold on demand.
- **`description` drives triggering.** Write it to say *when* to use the skill, with concrete trigger phrases — not just what it does. This is what Claude matches against.
- **Minimal frontmatter.** `name` + `description`. Add `disable-model-invocation: true` for side-effecting workflows you want invoked manually, not auto-triggered.
- **Don't restate what Claude already knows.** Skip standard language conventions, self-evident advice ("write clean code"), and file-by-file codebase descriptions. Link to external/API docs instead of pasting them — pasted docs go stale and cost context.

### `CLAUDE.md` / `AGENTS.md` content (include vs. exclude)

| ✅ Include | ❌ Exclude |
|---|---|
| Commands Claude can't guess | Anything Claude can infer from the code |
| Style rules that differ from defaults | Standard conventions Claude already knows |
| Testing instructions / preferred runner | Detailed API docs (link instead) |
| Repo etiquette (branch, PR, commit format) | Info that changes frequently |
| Project-specific architecture decisions | Long explanations or tutorials |
| Environment quirks (required env vars) | Self-evident practices |
| Common gotchas / non-obvious behavior | File-by-file descriptions |

Keep these files short. If a rule keeps getting ignored, the file is probably too long and the rule is getting lost — prune it. Use `IMPORTANT`/`YOU MUST` for emphasis on rules that must stick. Treat them like code: review and trim when behavior drifts.

### Working in this repo

- **Explore → plan → implement → commit.** Use plan mode when a change spans multiple files or the approach is unclear; skip it for trivial edits (typo, version bump, a single link).
- **Give Claude a check it can run.** Here that check is `claude plugin validate` (plus any `evals/evals.json`). Show the validate output as evidence — don't assert "it's valid" without running it. See [Testing](#testing).
- **Be specific.** Scope the task (which plugin, which skill), point to the file or existing pattern to follow, and for a fix describe the symptom + what "fixed" looks like.
- **Course-correct early; keep sessions focused.** `/clear` between unrelated tasks, `/compact` on long ones. Commit in small, descriptive steps.
- **Add an adversarial review before "done."** Run the bundled `/code-review` skill (reviews the diff in a fresh subagent) for correctness before treating work as complete.

---

## Languages and code style

This repo has no application code. The "source" is Markdown skill content and JSON manifests. (Skill-authoring rules live in [Claude Code best practices](#claude-code-best-practices-the-baseline-every-skill-follows) above.)

- **JSON manifests** (`marketplace.json`, `plugin.json`, `evals.json`): 2-space indent, double-quoted keys, no trailing commas, no comments (JSON, not JSONC). Match the existing files exactly.
- **`SKILL.md`**: YAML frontmatter with `name` and `description`, then the body. The `description` is what drives triggering — write it to say *when* to use the skill, with concrete trigger phrases, not just what it does.
- **Leanness / progressive disclosure**: keep `SKILL.md` focused; push deep reference material into `references/` and reusable output into `templates/`. Don't inline what a sibling file can hold.
- **No persona preambles, no non-standard frontmatter, no dead repo-relative links** in skills (these were stripped from derived content — don't reintroduce them; see [PITFALLS.md](./PITFALLS.md)).
- **Versions**: a plugin's `version` appears in both its `plugin.json` and its `marketplace.json` entry. They MUST match — bump both in the same commit.
- **Marketplace `name`**: never starts with `claude-`/`anthropic-` (reserved). Current name: `pedrohenriquens`.
- **`source` paths**: relative to repo root (`./plugins/<name>`); keep them in lockstep with folder names.

---

## Branching and PR workflow

Trunk-based on `main`. This is a small personal repo:

- Work directly toward `main` (branch for anything non-trivial or risky).
- Adding a plugin is one atomic change: its folder (`plugin.json` + at least one `SKILL.md`) **and** its `marketplace.json` entry land together.
- After any manifest change, run validation before committing (see Testing).
- Do not push to a remote or create a GitHub repo unless explicitly asked.

> TODO: Revisit if external contributors appear — may need PRs-only-to-main with required validation.

---

## Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/). Types in use:

- `feat` — new plugin, new skill, or new capability.
- `fix` — correct a manifest, name, link, or skill error.
- `chore` — repo housekeeping (gitignore, attributes, NOTICE).
- `docs` — changes to `docs/`, `README.md`, `AGENTS.md`, `CLAUDE.md`.
- `refactor` / `test` — as applicable.

**Scope** is the plugin name or `marketplace` (e.g. `feat(project-initializer):`, `fix(marketplace):`). Matches existing history.

---

## Testing

There is no test framework. Validation is the gate — run it locally exactly as CI does (`.github/workflows/validate.yml`):

```
python3 scripts/check_compliance.py       # version-sync, frontmatter, dead links, reserved names
claude plugin validate .                  # the marketplace manifest
claude plugin validate ./plugins/<name>   # a single plugin + its skills
```

- Run the compliance script + the relevant `validate` after any manifest or skill change; both must pass before commit. The compliance script exits non-zero on a hard failure (size warnings don't fail).
- The judgment-based best-practice rules a script can't measure (`description` quality, progressive disclosure) are audited by the `skill-auditor` plugin on demand — not part of the blocking gate.
- Skills may carry `evals/evals.json` to guard triggering/quality — add or update these when changing a skill's `description` or behavior.

---

## Diagramming

> Mermaid only (plain text → agent-readable, diffable, renders for humans; never an exported image). Diagram a flow only when it has branching, ordering that matters, or 4+ non-obvious relationships AND is stable. Otherwise use prose, tables, or ASCII trees. Topology goes in the diagram; constraints ("idempotent", "never retry on 4xx") go in prose beside it. Derive strictly from code, cap ~7 nodes (split bigger flows), and update any diagram in the same commit as the code change it depicts.

---

## Documentation maintenance

These files are living documents. When you change the project, update the relevant doc in the same commit:

- Architectural change (manifest layering, install flow) → `docs/ARCHITECTURE.md` (and any Mermaid diagram it depicts, in the SAME commit).
- New/changed plugin or skill → `docs/FEATURES.md`.
- Discovered a gotcha → `docs/PITFALLS.md`.
- Stack change (new format, validation tooling, CI) → `docs/STACK.md`.
- Scope or requirements change → `docs/PRD.md` and `docs/SUMMARY.md`.
- New coding rule, banned shortcut, or workflow convention → add HERE (the source of truth).
- Phase reached or priorities shifted → `docs/ROADMAP.md`.

If you skip a doc update, note why in the commit message.

---

## Where conventions live

| Scope | File |
|---|---|
| This file | Project-wide coding rules |
| Past failures + fixes | `docs/PITFALLS.md` |

When establishing a new convention (in code review, brainstorming, direct user instruction), add it HERE in the same PR.

> Note: this is a **single-scope** repo for conventions. Although `plugins/` looks like a monorepo, every plugin follows the *same* authoring conventions (this file) — there are no plugin-specific coding rules, so no per-plugin `CONVENTIONS.md` is scaffolded. If a single plugin ever grows genuinely distinct rules, give it its own `plugins/<name>/docs/CONVENTIONS.md` and have it link back here, with service-level rules overriding these on conflict.
