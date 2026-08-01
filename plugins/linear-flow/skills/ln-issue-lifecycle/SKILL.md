---
name: ln-issue-lifecycle
description: >-
  Use for issue-shaped work in Linear the user has already named as such —
  "create an issue for…", "file a bug for…", "update ABC-123", "move it to a
  different status", "add a label to it", "comment on that issue", "close these",
  "break this into sub-issues", "attach it to the project", "groom the backlog",
  "relabel these", or /ln-issue-lifecycle. Covers creating issues directly plus
  every edit after: fields, labels, status, comments, sub-issues and parent
  links, and reviewed bulk changes. Do NOT trigger when the shape is unclear and
  needs deciding (that is ln-triage), for project or discovery work
  (ln-project-lifecycle), or for a status move driven by branch or PR state
  (ln-ship-loop).
---

# Issue lifecycle

Own a Linear issue from creation through every edit. Use this when the work is **already known** to be issue-shaped; deciding that is [`ln-triage`](../ln-triage/SKILL.md)'s job, and a status move driven by code state is [`ln-ship-loop`](../ln-ship-loop/SKILL.md)'s.

## Before acting

Resolve conventions **per section**: take each thing you need — status names and meanings, label groups, naming patterns — from **`~/.claude/linear-conventions.md`** if it declares that section, otherwise from the generic default in [`../../references/conventions.md`](../../references/conventions.md). A workspace file is expected to be partial. Anything neither declares is **asked, never guessed**.

Use the Linear tools per [`../../references/linear-mcp.md`](../../references/linear-mcp.md). **No Linear tools in the session → say so and stop.**

## Resolving the target

An identifier the user gave (`ABC-123`) is authoritative — fetch it and show the title back so a typo cannot silently retarget the write. Otherwise search open issues and **confirm the match before touching it**. Several plausible matches is a question, not a ranking.

## Creating

Search first — an existing issue should be updated, not duplicated. Then draft in full and show it: title per the workspace pattern, a practical description that invents nothing, labels the input actually determines, and a starting status. Create on approval, then report identifier and URL.

## Editing

Read the current value, then **propose it as a diff** — what the field says now, what it would say. This holds for titles, descriptions, labels, status, assignee, estimate, priority, and due dates.

- **Labels** — only ones that already exist. Adding a label from a single-select group *replaces* the group's current value; say so when proposing it.
- **Status** — move by the workspace's meaning, not the name's appearance. If the requested target does not exist on that team's workflow, list what does and ask.
- **Comments** — read the thread before adding to it. A comment that answers something already answered is noise.
- **Sub-issues and links** — breaking an issue up means the parent keeps the outcome and the children hold the work; propose the whole split at once, not one child at a time. Attaching to a project or milestone is an edit like any other: show it, confirm it. A **pull or merge request** is not: ask first what it is to the issue — resolves, contributes to, or merely related — and title the link with the answer ([`../../references/pr-relations.md`](../../references/pr-relations.md)).

## Bulk changes

**Never write to a set you have not listed back.** Before any multi-issue change:

1. Query the set, then show **every** affected issue — identifier and title, all of them. Not a description of the filter, not "and 40 more". If the list is too long to show, the filter is too broad: narrow it and re-show.
2. State the exact change to be applied to each.
3. Get approval **for that list**, then apply **one issue at a time** so a failure is partial and visible.
4. Report per-issue results, including any that failed and the state they were left in.

Recipes and the dry-run protocol: [`references/bulk-grooming.md`](./references/bulk-grooming.md).

## Rules

- **Confirm before every write**, single or bulk.
- **Never invent** description content, acceptance criteria, or repro steps the user did not give.
- **Never create labels or statuses** that do not exist — ask.
- **Closing is a decision.** Ask before closing or cancelling, and never close an issue with open sub-issues without saying what happens to them.
