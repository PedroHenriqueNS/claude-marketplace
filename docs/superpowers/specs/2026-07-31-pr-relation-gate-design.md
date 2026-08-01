# PR relation gate — design

**Date:** 2026-07-31 · **Plugin:** `linear-flow` · **Version:** `0.1.0` → `0.2.0`

## Problem

When `linear-flow` binds a pull request to a Linear issue, it attaches a bare link and then
proposes a status move from the PR's existence alone. Nothing captures *what the PR is to that
issue* — whether merging it completes the issue, moves it forward, or merely touches adjacent
code. The status proposal is therefore built on an unstated assumption, and the link itself
records no intent for whoever reads the issue later.

The fix: before attaching, ask whether the PR **resolves**, **contributes to**, or is merely
**related to** the issue, and record that answer in Linear.

## Research findings

Three facts, established from Linear's own documentation and the live MCP tool schemas, that
constrain the design:

1. **Linear has two native relation buckets, not three.** Its magic-word taxonomy splits into
   *closing* words (`close`, `fix`, `resolve`, `complete`, `implement` and their inflections),
   which automate status on merge, and *contributing* words (`ref`, `references`, `part of`,
   `related to`, `contributes to`, `towards`), which link without automating. Our three-way
   taxonomy maps onto this as: **resolves** → closing bucket; **contributes** and **related** →
   both the contributing bucket, distinguished by wording, not by Linear behavior.

2. **Magic words live in the PR description.** Making Linear itself act on the relation would
   require editing the PR body — a code-side write. `ln-ship-loop`'s standing rule is that it
   never commits, pushes, opens, or merges anything and is read-only on the code side.

3. **Project links exist in Linear but not in every MCP server.** Linear models a first-class
   project link (its project sidebar has a Resources section). The MCP server in the authoring
   session exposes `save_issue.links[{url, title}]` but no project equivalent on `save_project`.
   Server capability therefore varies and must be detected, not assumed either way.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| Where the relation is recorded | **Linear-side only** | Preserves the read-only-on-code rule. The answer sets the link attachment title *and* bounds the status proposal — behavioral gain with no new write surface. |
| Native magic words | **Documented, never written** | A user who wants Linear's merge automation is told the exact word to add to their own PR body. The plugin does not edit it for them. |
| Scope | **All three skills, one shared rule** | The taxonomy is one concept; the repo's convention is that a file two or more skills share lives at the plugin root. |
| Project fallback | **Route through an issue** | A PR delivers an issue; a project sees it through that issue. Honest about the shape, one code path, no fabricated project-side state. |
| Ask vs. infer | **Always ask; recommend only when evidence is unambiguous** | The ask is the requested behavior. A marked recommendation matches the show-then-confirm ethos used everywhere else in the plugin. |
| Status names | **Expressed as meanings, never names** | The workspace supplies its own status set; the plugin already resolves meanings per section from `~/.claude/linear-conventions.md` or the bundled default. |

## The taxonomy

Lives once in **`plugins/linear-flow/references/pr-relations.md`** (new). Every skill that
attaches a PR link points at it in one line rather than restating it.

| Answer | Means | Link title | Status ceiling |
|---|---|---|---|
| **Resolves** | Merging this PR completes the issue. | `Resolves · <PR title>` | May propose the workspace's completed or near-delivery status. |
| **Contributes** | Real progress toward the issue; work remains. | `Contributes to · <PR title>` | May propose a started status. **Never** a completed one. |
| **Related** | Context only; the issue is not advanced by this PR. | `Related · <PR title>` | **No** status move proposed. |

The reference also records Linear's two native buckets (finding 1) as documentation, so the
native path is discoverable without the plugin taking it.

### Ceiling, not instruction

The relation **caps** how far a status proposal may go; it never forces one. `ln-ship-loop`'s
existing rule — never move status on inference alone, and move only on approval — is unchanged
and still applies underneath the ceiling. A **Resolves** answer permits proposing completion; it
does not make completion automatic, and the user still approves the move.

## Where the gate fires

- **`ln-ship-loop`, step 4.** The ask precedes the attach. Its answer becomes the ceiling on
  step 5's status proposal.
- **`ln-issue-lifecycle`, *Sub-issues and links*.** When the link being added is a pull or merge
  request, run the gate. Other link types are unaffected.
- **`ln-project-lifecycle`.** A PR link routes to an issue under the project: state plainly that
  a PR attaches to an issue, ask which issue under this project it delivers, offer to create one
  if none fits. The gate then runs on that issue by the `ln-issue-lifecycle` path.

## The ask

One question, three answers, presented with **both** the PR title and the resolved issue title,
so a mis-matched issue is visible at the moment of decision rather than after the write.

A recommended answer is marked only when the evidence is unambiguous — for example, the branch
or PR title carries the issue identifier and the PR covers the whole of that issue's stated
work. Ambiguous evidence gets a plain ask with no steer. A recommendation is never auto-applied.

**Re-attaching.** If a relation is already recorded for this PR and issue, read the current
value and propose the change as a diff — what it says now, what it would say — matching the
rule `ln-issue-lifecycle` already applies to every other field.

## What does not change

- No writes to the PR, the branch, or the remote. `ln-ship-loop` remains read-only on the code
  side, full stop.
- No Linear tools are named. The project-link capability is detected at use time, per the
  plugin's existing server-agnostic contract in `references/linear-mcp.md`.
- Confirm-before-write is unchanged. The relation is part of the mutating call shown for
  approval, not a second approval gate on top of it.
- Skill `description` fields are unchanged — triggering is not affected by this work.

## Files touched

```
plugins/linear-flow/references/pr-relations.md          NEW  — the taxonomy
plugins/linear-flow/skills/ln-ship-loop/SKILL.md             — step 4 gate, step 5 ceiling
plugins/linear-flow/skills/ln-issue-lifecycle/SKILL.md       — links section
plugins/linear-flow/skills/ln-project-lifecycle/SKILL.md     — route PR links to an issue
plugins/linear-flow/skills/ln-ship-loop/evals/evals.json     — +1 eval
plugins/linear-flow/skills/ln-issue-lifecycle/evals/evals.json   — +1 eval
plugins/linear-flow/skills/ln-project-lifecycle/evals/evals.json — +1 eval
plugins/linear-flow/.claude-plugin/plugin.json               — 0.1.0 → 0.2.0
.claude-plugin/marketplace.json                              — 0.1.0 → 0.2.0 (same commit)
docs/FEATURES.md                                             — linear-flow behavior paragraph
```

## Verification

```
python3 scripts/check_compliance.py
claude plugin validate .
claude plugin validate ./plugins/linear-flow
```

Both must pass before commit, with output shown as evidence. The version bump must land in
`plugin.json` and `marketplace.json` in the same commit — the compliance script hard-fails on
drift.

## Out of scope

- Writing magic words into PR descriptions. Documented in the reference; not automated.
- A project-side link surface for MCP servers that expose one. The routing fallback is the
  single path for now; adding capability detection for a project-link tool is a later change if
  a server that has one shows up.
- The open `disable-model-invocation` question for the five `ln-*` skills, tracked separately in
  `docs/ROADMAP.md`.
