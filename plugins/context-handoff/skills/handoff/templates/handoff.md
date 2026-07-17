# Handoff — <one-line: what this work is>

> Cold-start doc for a fresh agent with zero memory of the session that produced it. Read
> top to bottom, then run the Resume ritual to re-verify before trusting anything below.

## 1. Objective (+why)

<!-- The goal in one line, and the reason it was chosen — so it isn't re-litigated. -->

## 2. Status

<!-- Current phase. What's working. What's half-done, and exactly where it stops. -->

## 3. Decisions made (+reasoning)

<!-- The context that dies on /clear. One bullet per decision: chosen, rejected, why. -->

-

## 4. State on disk

<!-- Branch. Files created/modified. Uncommitted or staged changes. -->

- **Branch:**
- **Modified/created:**
- **Uncommitted:**

## 5. Verification

<!-- Two lists, kept separate. Verified ≠ claimed. -->

**Verified (ran and passing):**

-

**Claimed but not verified:**

-

## 6. Next actions

<!-- Ordered TODO. The FIRST item MUST be a literal runnable command. -->

1.

## 7. Landmines

<!-- Dead ends already tried; gotchas not to retry. Each: what was tried, why it failed. -->

-

## 8. Resume ritual

<!-- Literal commands to reach a working state, INCLUDING re-derive-ground-truth commands
     (git status, the test/build command) so the fresh agent re-verifies rather than
     trusting this document. -->

```bash
git status
git diff --stat
# <the project's test/build command>
```
