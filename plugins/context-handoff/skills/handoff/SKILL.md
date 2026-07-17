---
name: handoff
description: >-
  Use when the user wants to capture the current session's state into a cold-start
  HANDOFF.md before wiping context, so a fresh Claude with zero memory can resume in
  ~30 seconds after /clear or /compact. Trigger on explicit intent to hand off or reset
  context — "write a handoff", "hand this off", "prep for /clear", "before I clear",
  "wrap up and clear", "context is getting full", "/compact and continue later". Do NOT
  trigger on a bare "wrap up", "summarize", or end-of-task recap with no intent to clear
  or compact; this is specifically for surviving a context reset.
---

# Handoff

Generate a cold-start `HANDOFF.md`: a document that lets a fresh Claude with zero memory of this session become productive in ~30 seconds after `/clear` or `/compact`. The reader has amnesia — the document's only job is to stop them re-doing work or re-making mistakes. This is deliberately not `/compact` (which summarizes for the same session and loses decision rationale) and not a generic state dump. Write it for the cold reader.

## When to use

Trigger only on explicit intent to hand off or survive a context reset: "write a handoff", "hand this off", "prep for /clear", "before I clear", "wrap up and clear", "context is getting full", "/compact and continue later".

Do NOT trigger on a bare "wrap up", "summarize", or end-of-task recap with no intent to clear or compact.

## Core discipline

- **Gather ground truth before writing — never invent state.** Every claim traces to git, a memory tool, or the live conversation.
- **Verified ≠ claimed.** Keep what you actually ran and saw passing separate from what was only asserted. Mark anything you cannot confirm `unverified`.
- **Lean and skimmable.** It is read under time pressure.

## Procedure

1. **Gather ground truth.** Run `git status`, `git diff --stat`, and read the current branch. Then sweep for whatever memory tooling exists and pull recent decisions/errors from it. Degrade gracefully to git + the live conversation when none is present. Detection ladder and per-section spec: [`references/handoff-spec.md`](./references/handoff-spec.md).
2. **Fill the template.** Copy [`templates/handoff.md`](./templates/handoff.md) and fill every section from the evidence gathered. Mark anything unverifiable as `unverified`; leave no placeholder text.
3. **Write it.** Save to `HANDOFF.md` at the repo root, overwriting any existing one.
4. **Keep it out of history.** Ensure `HANDOFF.md` is in `.gitignore` — append the line if missing, create `.gitignore` if absent. It is ephemeral working state, not history.

## The eight sections (in this order)

Objective (+why) · Status · Decisions made (+reasoning) · State on disk · Verification · Next actions · Landmines · Resume ritual.

Each is specified in [`references/handoff-spec.md`](./references/handoff-spec.md); the fill-in skeleton is [`templates/handoff.md`](./templates/handoff.md).
