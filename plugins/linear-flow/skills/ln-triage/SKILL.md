---
name: ln-triage
description: >-
  Use when the user describes work in rough terms and wants it tracked in Linear
  without saying what shape it should take — "add this to Linear", "track this",
  "log this work", "create something for this", "put this in the backlog", or
  /ln-triage followed by a loose description. Decides project vs issue using the
  workspace's own rule, then creates it with the right naming pattern, labels,
  template, and starting status. Do NOT trigger when the user already named the
  shape ("create an issue for…" is ln-issue-lifecycle, "start a project/discovery
  for…" is ln-project-lifecycle), to edit something that already exists, or to
  ask what to work on next (that is ln-whats-next).
---

# Triage into Linear

Turn a rough description of work into exactly one correctly-shaped Linear item. The judgment call — project or issue — is the point of this skill; everything after it is mechanics.

## Before acting

Resolve conventions **per section**: take each thing you need — the project-vs-issue rule, naming patterns, label groups, statuses — from **`~/.claude/linear-conventions.md`** if it declares that section, otherwise from the generic default in [`../../references/conventions.md`](../../references/conventions.md). A workspace file is expected to be partial. Anything neither declares is **asked, never guessed**.

Use the Linear tools per [`../../references/linear-mcp.md`](../../references/linear-mcp.md): resolve names to IDs live, confirm before writing, report what the API returned. **No Linear tools in the session → say so and stop** — never create from memory or fall back to the web UI.

## Procedure

1. **Search first.** Look for an existing issue or project covering this work. If one plausibly matches, show it and ask — a duplicate is worse than a missing item. If the user wants that item **updated** rather than a new one created, **hand off and stop**: editing what already exists belongs to [`ln-issue-lifecycle`](../ln-issue-lifecycle/SKILL.md) or [`ln-project-lifecycle`](../ln-project-lifecycle/SKILL.md), which read current values and propose a diff. Drafting a replacement here would overwrite context this skill never read.

2. **Classify.** Apply the workspace's project-vs-issue rule. State the call and the one fact that decided it. When it is genuinely ambiguous, **ask before creating** — say which way you lean and why. Ambiguity is the signal to ask, not to default.

3. **Discover** what the item needs: team, available statuses, label groups, templates. Only labels and statuses that already exist may be used.

4. **Draft the whole item** and show it before any write:
   - Title, following the naming pattern for its category.
   - Description, following the shape for its kind — projects use [`../../templates/project-description.md`](../../templates/project-description.md), discoveries [`../../templates/discovery-description.md`](../../templates/discovery-description.md), unless the workspace declares its own.
   - Labels, drawn only from the groups the workspace declares or discovery found — each only where the input actually determines its value.
   - Starting status, and a template if one matches the work.

5. **Create on approval**, then report the identifier and URL.

## Rules

- **One item per invocation.** A description that contains several separable pieces of work is a signal to ask how to split it, not a licence to create four things.
- **Never invent content.** No acceptance criteria, scope, or constraints the user did not give. An empty section beats a plausible guess.
- **Never create labels, statuses, or templates.** If the right one does not exist, say so and ask.
- **Leave a label off rather than approximate it.** A label group whose value the input does not clearly determine is a question, not a coin flip.
