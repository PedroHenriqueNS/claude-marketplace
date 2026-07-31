---
name: ln-whats-next
description: >-
  Use when the user asks what to work on or wants a read on the current state of
  their Linear work — "what should I work on", "what's next", "what's in
  flight", "where are things", "what's blocked", "anything close to shipping",
  "give me a status of my work", or /ln-whats-next. Reads the workspace and
  answers, biased toward active, blocked, near-deploy, and current-client work,
  grouped by client and project. Read-only — it never creates or changes
  anything. Do NOT trigger to create work (ln-triage), to edit an issue
  (ln-issue-lifecycle), or to write a project status update
  (ln-project-lifecycle).
---

# What's next

Answer "what should I work on" from the actual workspace, not from memory. **This skill never writes** — no creates, no status moves, no comments.

## Before acting

Resolve conventions **per section**: take each thing you need from **`~/.claude/linear-conventions.md`** if it declares that section, otherwise from the generic default in [`../../references/conventions.md`](../../references/conventions.md). The status ladder and its *meanings* matter most here — "which status means nearly shipped" is a judgment the API cannot answer.

Read via the Linear tools per [`../../references/linear-mcp.md`](../../references/linear-mcp.md). **No Linear tools in the session → say so and stop.** Answering this question from memory, the repo, or the conversation fabricates a workspace; there is no acceptable degraded answer.

## Procedure

1. **Read the workspace.** Prefer the saved views the conventions declare; otherwise query active projects and the user's open issues. If the workspace declares no views and none of this is obvious, ask which team or project to scope to rather than pulling everything.

2. **Rank by these, in order:**
   - **In progress** — already started, finishing beats starting.
   - **Blocked** — surface it even though it is not actionable; unblocking is usually the highest-value move available.
   - **Near delivery** — whatever status means "done bar shipping". Cheap to close out.
   - **Current engagement** — where the workspace declares a client, customer, or similar dimension, work for one already in flight beats work for one that is not. Skip this rank entirely when it declares none.

3. **Group by project**, plus whatever client or customer dimension the workspace declares — never by status column or process ceremony. Within a group, order by the ranking above.

4. **Output** — one line per item: identifier, title, status, and only the detail that explains its rank. Then **one recommendation**: the single next thing, and why it beat the runner-up.

## Rules

- **Read-only.** If the user asks for a change mid-answer, hand off to the skill that owns it rather than writing here.
- **Short beats complete.** Surface what is live; do not enumerate the backlog. If nothing is active, say so plainly and offer the few strongest backlog candidates.
- **Report the workspace, not an impression of it.** Every item named comes from a tool result. If a query failed or returned nothing, say that instead of filling the gap.
