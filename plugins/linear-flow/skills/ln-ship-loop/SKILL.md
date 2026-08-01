---
name: ln-ship-loop
description: >-
  Use when code state should be reflected in Linear — "the PR is open", "this
  branch is merged", "I just shipped this", "link this branch to Linear", "sync
  Linear with my PR", "deployed, update the ticket", or /ln-ship-loop. Reads the
  current branch, commits, and PR to find or create the matching issue, attaches
  the PR, and moves the issue's status to match where the code actually is. Does
  NOT commit, push, or open pull requests. Do NOT trigger for a status change
  the user asked for directly ("move ABC-123 to <status>" is ln-issue-lifecycle),
  for git work with no Linear intent, or to decide what to work on next
  (ln-whats-next).
---

# Ship loop

Keep Linear honest about where the code is. Reads git and GitHub; **writes only to Linear**.

## Before acting

Resolve conventions **per section**: take each thing you need — status meanings, the project-vs-issue rule, naming patterns — from **`~/.claude/linear-conventions.md`** if it declares that section, otherwise from the generic default in [`../../references/conventions.md`](../../references/conventions.md). The status *meanings* are what this skill runs on — the same status name can mean merged-awaiting-production in one workspace and already-live-on-staging in another, and guessing wrong misreports shipped work.

Use the Linear tools per [`../../references/linear-mcp.md`](../../references/linear-mcp.md). **No Linear tools in the session → say so and stop.**

## Procedure

1. **Read the code state.** Current branch and the commits not on the main branch, from git. Then look for a pull/merge request using whatever the host offers — `gh pr view` on GitHub, `glab mr view` on GitLab, otherwise the remote URL and whatever CLI is authenticated.

   A lookup that **fails** — no such CLI, not authenticated, unsupported host — is **unknown, not absent**. Say which lookup failed, and either ask for the PR URL or continue without one, explicitly. Never let a failed command become the fact "there is no PR".

2. **Find the issue**, in this order: an identifier in the branch name, commit messages, or PR title; then a text search of open issues against the branch's subject. Show the match and confirm it before using it. **Two plausible matches is a question, not a ranking** — ask.

3. **Nothing tracked yet?** Offer to create it, shaped by the **workspace's own project-vs-issue rule** — do not assume. A branch usually points at an execution item, but a workspace may require this work to live under a project, or as one. Draft from the commits and PR, show it, create on approval; if the rule makes it project-shaped, say so and use [`ln-project-lifecycle`](../ln-project-lifecycle/SKILL.md)'s description shape.

4. **Ask what the PR is to the issue** — resolves it, contributes to it, or is merely related to it — then attach it as a link **titled with that answer**. Attach only the link; do not paste the diff or a generated summary into the description. The three answers, their wording, and the project case: [`../../references/pr-relations.md`](../../references/pr-relations.md).

5. **Propose the status move** that matches the code, expressed in the workspace's own statuses and meanings and **bounded by step 4's answer** — a PR that only contributes cannot justify a completed status, and one that is merely related justifies no move at all. Show current → proposed and the evidence for it. **Move only on approval.**

6. **Report** the issue identifier and URL, what was attached, and the status transition actually applied.

## Rules

- **Never commits, pushes, opens, or merges anything.** Those belong to the user and to git-side tooling. This skill is read-only on the code side, full stop.
- **Never moves status on inference alone.** "The PR exists" is evidence; "it is probably done" is not.
- **One branch, one issue.** If the branch legitimately spans several issues, ask which one owns the status move rather than moving all of them.
- **Missing PR is not failure; a failed lookup is not a missing PR.** A branch with commits and genuinely no PR is a normal state — reflect it, do not invent a PR URL. A lookup that errored is a *third* state: report it as unknown rather than collapsing it into "none".
