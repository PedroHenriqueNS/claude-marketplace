---
name: setup-operating-model
description: >-
  Use when the user explicitly asks to set up an agent operating model or agent team for
  a project — "set up an agent team for this project", "set up an operating model",
  "which agents does this project need", "create leads and specialists", "organize
  subagents into leads and specialists". Reads the repo, sizes leads and specialists from
  its signals, proposes the whole model, and writes docs/OPERATING-MODEL.md,
  .claude/agents/ files and a CLAUDE.md pointer only after approval. Also re-runs on a
  project that already has agents, proposing only the delta. Do NOT use to create one
  single subagent ("create a code-reviewer subagent"), and NOT to initialize or scaffold
  project docs ("init this project") — that belongs to project-initializer — and NOT for Claude Code's experimental agent teams (multi-session) feature.
---

# Set up an agent operating model

Generate a project's agent operating model: a main session acting as CEO, leads per area, specialists, a fixed report format, per-task model and effort rules with a floor in every agent file, and a review cadence. Read, ask little, propose once, write after one "yes".

## Step 1 — Read the project

Collect signals and record the path each came from. The list and how to count areas are in [references/sizing-signals.md](references/sizing-signals.md). Count code volume with a command that prints totals (`find … | wc -l` style), never by reading files. Read, when present: `AGENTS.md`, `CLAUDE.md`, `docs/PRD.md`, `docs/ROADMAP.md`, `docs/CONVENTIONS.md`, `docs/ARCHITECTURE.md`, and the user's `CLAUDE.md` if it is reachable.

If `.claude/agents/` or an `OPERATING-MODEL.md` already exists, switch to update mode: follow [references/update-mode.md](references/update-mode.md) for every later step.

Count recent commits (for example `git log --since="8 weeks ago" --oneline`) to set the periodic review's frequency: weekly at 8 or more commits in that window, every two weeks at 3–7, monthly at 2 or fewer.

From the `CLAUDE.md` files, note what the environment already decides and inherit it instead of inventing it:

- **Language.** The owner's language sets the language of reports, questions and headings, and the agent file names: Portuguese → `lider-<area>.md` / `especialista-<tarefa>.md`; any other → `lead-<area>.md` / `specialist-<task>.md`.
- **Shell and context tooling rules.** If a `CLAUDE.md` already has rules for shell commands or for reading files, the protocol points at them; never copy them. If none exist, write nothing about it.
- **Owner-contact style.** Use the environment's own; build none in.

## Step 2 — Size the model

Count justified areas and pick the tier from the table in [references/sizing-signals.md](references/sizing-signals.md): Small (1–2, no leads), Medium (3–5), Large (6+). Code volume only breaks a tie at a boundary. Every area and every agent must trace to a signal; drop anything that doesn't. An area the owner names in answer to question 2 counts, with ``Signal: `owner answer, question 2` `` (or its ROADMAP path).

## Step 3 — Ask at most three questions

Only what the repo cannot show, one question per message, multiple choice, your inferred answer first as the recommendation. **Skip any question the request already answers**; if all three are answered, go straight to the proposal.

1. Who the human owner is: one person or a team.
2. Areas planned that have no code yet.
3. What must never happen without the owner (extends the owner-only list).

Every other open point goes into the proposal as an editable default — never a fourth question.

## Step 4 — Propose, in one message

Use this shape so it can be checked line by line, in the owner's language for prose but with these literal keys:

```
Tier: <Small|Medium|Large> (<N> justified areas)
Chain of command: owner → main session → <leads → >specialists

Areas
- <area> — <one line>. Signal: `<path>`

Agents
- <file name> (<lead|specialist|reviewer>, model <alias> / effort <level>) — <one line>. Signal: `<path>`

Editable defaults
- Worktrees: read-only work only (change if your tooling allows agents to commit there)
- Periodic agent review: off until you say yes; <weekly | from commit rhythm> when on
- <other defaults>

Files
- create docs/OPERATING-MODEL.md
- create .claude/agents/<name>.md  (one line per agent)
- create|change CLAUDE.md — adds the "Operating model" pointer section
```

For a `CLAUDE.md` that already exists, show the section's diff right after the block; that diff is its per-file approval, so the one "yes" covers it. Small tier lists no lead. Floors come from [references/model-effort.md](references/model-effort.md). Then stop and wait. Write nothing before an explicit yes.

## Step 5 — Write, after one "yes"

- `docs/OPERATING-MODEL.md` from [templates/operating-model.md](templates/operating-model.md); drop the lead layer and its sections for Small tier.
- One `.claude/agents/` file per approved agent, from [templates/lead.md](templates/lead.md) or [templates/specialist.md](templates/specialist.md). Every file sets its `model` and `effort` floor. Reviewers and auditors also set `disallowedTools: Edit, Write, NotebookEdit`.
- The pointer section from [templates/claude-md-section.md](templates/claude-md-section.md), always in `CLAUDE.md` (even when it only imports `AGENTS.md`); create `CLAUDE.md` with only that section if it is missing.
- **Never overwrite an existing file** without showing its diff and getting an OK for that file (the `CLAUDE.md` diff shown in the proposal counts).
- Name models by alias only (`opus`, `sonnet`, `haiku`), never by full model ID.
- If a write is denied, stop that write: no retry by another route or tool. Finish the rest, then report the denial text and the files not written, and let the owner pick the fix.

Close with a short report: files written, files skipped and why, and the editable defaults still open.
