# Handoff spec — how to gather ground truth and fill each section

Reference for the `handoff` skill. `SKILL.md` carries the procedure; this file carries the
detail: where the evidence comes from, and what belongs in each of the eight sections.

## Gather ground truth first

Never invent state. Everything in the handoff traces to one of three evidence sources, in
this order of reliability:

1. **Git (always available in a repo).**
   - `git status` — branch, staged / unstaged / untracked.
   - `git diff --stat` — what changed and how much.
   - `git log --oneline -10` — recent commits, for the Status and Decisions sections.
   - The current branch name.
2. **Memory tooling — detect what exists, do not assume.** Sweep for any of these and pull
   recent decisions and errors from whatever is present:
   - `.remember/` files at the repo root (e.g. `now.md`, `recent.md`).
   - claude-mem observations (timeline / recent session memory).
   - context-mode timeline memory.
   - Any other session-memory store the environment exposes.

   Do not hard-depend on any one tool. If a query fails or the tool is absent, skip it and
   move on — no single tool is required.
3. **The live conversation.** Decisions, rejected approaches, and rationale that never
   reached git or a memory tool. This is often the highest-value source and the one
   `/compact` discards — mine it deliberately.

**Degrade gracefully:** git alone plus the live conversation is enough to write a useful
handoff. Memory tools enrich it; their absence never blocks it.

**Verified ≠ claimed.** As you gather, tag each fact: did you *run* it and see it pass, or
is it only *asserted*? That tag drives Section 5. Anything you cannot confirm is
`unverified` — label it rather than implying certainty.

## The eight sections

### 1. Objective (+why)
The goal in one line, plus the reason it was chosen — so the fresh agent does not
re-litigate a settled decision. One or two sentences.

### 2. Status
Current phase. What is working (done and verified). What is half-done — and exactly where
it stops, so work resumes at the edge rather than the start.

### 3. Decisions made (+reasoning)
The context that dies on `/clear`. One bullet per decision: what was chosen, what was
rejected, and why. Settings, library/config choices, naming, trade-offs. Without the
"why", the fresh agent re-opens closed questions.

### 4. State on disk
Branch. Files created/modified (from `git diff --stat`). Uncommitted or staged changes.
Anything intentionally left uncommitted, and why.

### 5. Verification
Two separate lists — the separation is the point:
- **Verified:** commands actually run, with the passing output/result. Evidence, not
  assertion.
- **Claimed but not verified:** things believed true but never exercised.

Never merge the two. A fresh agent that trusts a "claimed" item as "verified" burns the
session chasing a failure that was never actually ruled out.

### 6. Next actions
An ordered TODO. The **first item must be a literal runnable command** — copy-paste and
act, no interpretation. Order by what unblocks the most.

### 7. Landmines
Dead ends already tried and gotchas not to retry. Each entry: what was tried, and why it
failed or was abandoned. This is what stops the amnesiac reader from re-walking a path
already known to be a dead end.

### 8. Resume ritual
Literal commands to get back to a working state. **Include re-derive-ground-truth
commands** — `git status`, the test/build command — so the fresh agent re-verifies against
reality instead of trusting this document. The handoff is a starting point to be checked,
not a source of truth to be believed.
