<!--
Template for docs/OPERATING-MODEL.md. Fill every {{placeholder}}; delete these comments.
Write it in the owner's language (headings included). For a Small-tier project, remove
the Leads row, the Areas table's Lead column, the Lead rotation rule and lead-specific lines.
When headings are translated, update the in-file anchor (#report-format-…) and the
"§ <section>" names cited in the agent files to match.
Values marked "default — tune" are starting values the owner adjusts.
-->

# {{Project}} — Operating model

{{Project}} is built by an agent organization running in Claude Code for {{owner: one person | a team}}. This file is the protocol every agent follows. The main session, every lead and every specialist read it first.

## Chain of command

| Role | Who | Defined in | Talks to |
|---|---|---|---|
| **Owner** | {{owner}} | — | The main session |
| **Main session ("CEO")** | The main Claude Code session in this repo | `CLAUDE.md` + this file | The owner and the leads |
| **Leads** | One per area | `.claude/agents/{{lead-prefix}}-*.md` | The main session (report) and their specialists |
| **Specialists** | Reusable experts per task type | `.claude/agents/{{specialist-prefix}}-*.md` | Whoever spawned them (report) |
| **Team members** | Ad-hoc implementers and reviewers spawned for one task | The spawn prompt | Whoever spawned them (report) |

### Areas

| Area | Lead | Specialists | Signal |
|---|---|---|---|
| {{area}} | `{{lead}}` | `{{specialist}}`, … | `{{path}}` |

## Models and effort

Every spawn sets `model` explicitly, and sets `effort` explicitly where the CLI supports the per-invocation parameter (Claude Code 2.1.292 or later). Otherwise the floor in the agent file applies. Models are named by alias, never by full ID.

| Work | `model` | `effort` |
|---|---|---|
| Lookups and formatting | `sonnet` (or `haiku`, see below) | `low` |
| Mechanical work: routine edits, docs, config, ports a plan already defines — and its review | `sonnet` for the work, `opus` for the review | `medium` |
| Real logic, design | `opus` | `high` for logic; `medium` when a plan already holds the design |
| Review where personal data, money, auth or a hard constraint is at stake | `opus` | `high` |
| Leads | `opus` | `medium`, `high` for a hard area |
| Anything at `xhigh` or `max` | — | Only with the main session's explicit OK |

- `haiku` with `low` only for a lookup whose answer can be checked, or for running a gate and summarizing its result. Never for logic, security, personal data, money, docs, reviews or leads.
- Each agent file carries a floor (`model`/`effort` in its frontmatter) for spawns that omit the parameters. The floor is a safety net, not the choice.
- Prefer resuming a finished agent with `SendMessage` over spawning a new one for the same thread of work.
- A lead waits for every child it spawned to return before handing back.
- **Lead rotation:** a lead is replaced by a fresh one at each plan stop point, or when its transcript passes about {{5 MB}} of text (images excluded) or {{150}} model turns, whichever comes first. (default — tune)

## Talking to the owner

- Only the main session talks to the owner. {{Point at the owner-contact rules already in CLAUDE.md, if any.}}
- Before asking, the main session checks whether the docs already answer the question; if so, it answers itself and cites the file.
- Subagents cannot ask the owner. When they need a decision they stop at a safe point and end their report with a questions block. The main session asks the owner, then resumes the agent with `SendMessage`, passing the answers verbatim.

### Report format (every agent)

Headings in {{language}}:

```
## Report — <agent> — <task>
**Result:** <one line>
**Done:** <bullets>
**Evidence:** <commands run and what they returned, files>
**Files and commits:** <paths, commit hashes>
**Questions:**
1. <question> — context: <one line>; options: A (recommended) …, B …; blocking: yes/no
**Risks and next steps:** <bullets>
```

Evidence, not assertions: anything not run is written as "not verified". Short lists, not prose.

### When a permission check denies an action

The agent stops that action: no rewording and retrying, no other tool for the same result, no handing it to another agent. It finishes what does not depend on it and returns the denial's exact text to whoever spawned it. The main session reports the action, its purpose and the denial text to the owner, and the owner picks the fix.

## How work flows

### Briefs

- A brief points at a rule or a plan section by its line range; it never copies it. Copies drift.
- A brief never tells an agent to get around a tool's protection.
- A brief ends with one line pointing at [Report format](#report-format-every-agent).
{{- If CLAUDE.md has shell or file-reading rules: "A brief points at <that rule> and does not restate it."}}

### Review cadence

- **Per task, by risk:** a read-only reviewer per task where personal data, money, auth or a hard constraint is involved. Low-risk tracks get one reviewer per group of tasks.
- A finding that is only wording is fixed directly, without a new review round.
- Reviewers and auditors are read-only agents (`disallowedTools: Edit, Write, NotebookEdit`).

### Parallel work

- Agents run in parallel only when their scopes don't overlap.
- One writer at a time in the main checkout.
- Worktrees: {{read-only work only}}. (default — tune)

## Owner-only actions

Nobody but the owner does these. Agents prepare the exact steps and drafts; the owner acts.

- Creating or configuring third-party accounts, domains or services.
- Spending money.
- Publishing or sending anything public or to other people.
- Pushing or merging the default branch.
- Changing `.claude/` settings files (`.claude/settings*.json`) and permissions.
{{- Items from the owner's answer to "what must never happen without you".}}

## Session hygiene

- The main session keeps its context lean: reading and research go to agents; it keeps decisions and status.
- Before `/clear` or `/compact`, the main session writes a handoff file with the goal, state, decisions and next steps.
- Merged worktrees and branches are cleaned up.

## Periodic agent review

{{off | on, weekly}} (default: off until the owner says yes; weekly when on — tune to the repo's commit rhythm)

- It runs only on the owner's yes, in a separate session, conducted by {{the quality lead | a read-only reviewer the main session spawns for it}}.
- It covers the period's agent transcripts (summarized by a script, not read whole), commits, reports and denials.
- It delivers `docs/agent-reviews/YYYY-MM-DD.md`, one item per problem: the agent, the problem, the evidence, the proposed fix.
- Fixes land item by item, only with the owner's approval.
