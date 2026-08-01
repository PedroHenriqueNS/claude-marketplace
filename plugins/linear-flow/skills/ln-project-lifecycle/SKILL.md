---
name: ln-project-lifecycle
description: >-
  Use for project-shaped work in Linear the user has already named as such —
  "create a project for…", "start a discovery on…", "spin up a project for this
  client job", "update the project scope", "add a milestone", "post a project
  update", "close out this project", or /ln-project-lifecycle. Covers creating
  projects and discoveries with the right naming pattern, labels, and
  description shape, plus everything after: scope edits, milestones, and status
  updates. Do NOT trigger when the shape is unclear and needs deciding (that is
  ln-triage), for a single small execution item (ln-issue-lifecycle), or to bind
  a branch or PR to work (ln-ship-loop).
---

# Project lifecycle

Own a Linear project from creation through its updates. Use this when the work is **already known** to be project-shaped; deciding that is [`ln-triage`](../ln-triage/SKILL.md)'s job.

## Before acting

Resolve conventions **per section**: take each thing you need — naming patterns, description shapes, project label groups, templates — from **`~/.claude/linear-conventions.md`** if it declares that section, otherwise from the generic default in [`../../references/conventions.md`](../../references/conventions.md). A workspace file is expected to be partial. Anything neither declares is **asked, never guessed**.

Use the Linear tools per [`../../references/linear-mcp.md`](../../references/linear-mcp.md). **No Linear tools in the session → say so and stop.**

## Creating

1. **Discovery or project?** A discovery is bounded by a question with an unknown answer; a project is bounded by a deliverable. If the user says "spike", "investigate", or "figure out whether", it is a discovery.
2. **Search first** — an existing project covering this scope should be extended, not duplicated.
3. **Draft in full and show it:** title per the pattern for its category, description per [`../../templates/project-description.md`](../../templates/project-description.md) or [`../../templates/discovery-description.md`](../../templates/discovery-description.md) (a workspace's own shape overrides these), project-side labels, and a Linear template if one matches.
4. **Create on approval**; report identifier and URL.

## Updating

**Read the current state first, then propose a diff** — show what the field says now and what it would say, not just the new value. This applies to scope changes, description rewrites, label changes, and lead or target-date changes alike.

Rewriting a description **preserves what is still true**. A scope change is an edit to the Scope section, not a regenerated document.

**A pull or merge request is not a project edit.** A PR attaches to an issue; the project sees it through that issue. Route it per [`../../references/pr-relations.md`](../../references/pr-relations.md).

## Milestones and status updates

- **Milestones** are delivery checkpoints, not a task list. If a proposed milestone is really one unit of work, it is an issue.
- **Status updates** are written from evidence — what actually moved since the last one. Read the previous update first so the new one continues it rather than restating it. Include the health signal the workspace uses, and never report progress no tool result supports.

## Rules

- **Confirm before every write**, including updates that look minor. Descriptions are shared context.
- **Never invent** scope, constraints, dates, or delivery criteria. An empty section beats a plausible one.
- **Never create labels or templates** that do not exist — ask.
- **Closing is a decision, not a cleanup.** Ask before marking a project completed or cancelled, and say what is left open under it.
