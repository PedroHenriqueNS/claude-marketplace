---
name: to-prd
description: Turn the current conversation into a feature-level PRD and publish it as an agent-ready work item — no interview, just synthesis of what you've already discussed plus the code. Publishes to the configured issue tracker, or falls back to a local docs/prds/ file when the project has no tracker. Reads the project's living docs (the project-initializer set when present) for conventions, design decisions, and prior art. Manual invocation only — run /to-prd after discussing a change you want written up.
disable-model-invocation: true
---

# to-prd

Turn the **current conversation** into a feature-level PRD and publish it as an agent-ready work item. Do NOT interview the user for new requirements — synthesize what you've already discussed and what the code shows. Two narrow yes/no checkpoints are still fine: confirming the test seams (Step 2) and flagging a product non-goal conflict (Step 1). Those are confirmations, not an interview.

This PRD scopes **one feature or change**. It is not the product-level `docs/PRD.md` (whole-product problem / users / goals / non-goals) that `project-initializer` creates. Read that file for context and stay consistent with it, but never overwrite it — the two PRDs live at different altitudes.

Write the PRD in the language of the project's existing docs. If they disagree, follow `docs/PRD.md`, then `AGENTS.md`, then whichever living doc exists; if the project has no docs, use the conversation's language.

## Process

### 1. Load context

Prefer the project's living docs over blind exploration — they are the curated, agreed-upon source. Read whichever exist:

| Doc | Use it for |
|---|---|
| `AGENTS.md` | project overview, the domain terms the project actually uses (mirror them in the PRD), dev workflow, conventions summary |
| `docs/PRD.md` | product goals / non-goals / constraints — keep the feature consistent; if it contradicts a non-goal, flag that to the user before writing. **Never edit this file.** |
| `docs/CONVENTIONS.md` | testing rules, banned shortcuts, library choices — source of truth for the Testing & Implementation Decisions sections |
| `docs/ARCHITECTURE.md` | module boundaries + recorded design decisions (and any ADRs) — your seams must respect them |
| `docs/FEATURES.md` | prior art + status — don't duplicate a shipped feature; reuse its seams |
| `docs/PITFALLS.md` | known gotchas to design around and call out explicitly |
| `docs/STACK.md` | stack details for technical clarifications |
| `docs/ROADMAP.md` | current phases + in-flight work — so you slot the feature into the right phase in Step 5 and don't re-scope something already there |
| `docs/EVENTS.md` | *(if present)* event topology — prior art for any feature that publishes or consumes a routing-key / topic |

If these docs are absent, explore the repo directly to gather the same understanding (state, conventions, prior art, terminology). When a doc disagrees with the code, trust the code and note the stale doc to the user — code is ground truth.

### 2. Choose the test seams

Sketch the seams at which the feature will be tested. Prefer existing seams (cross-check `docs/ARCHITECTURE.md`, the Testing section of `docs/CONVENTIONS.md`, and prior art in `docs/FEATURES.md`) over new ones, and pick the highest seam possible. The fewer seams across the codebase, the better — the ideal number is one. If a new seam is needed, propose it at the highest point you can.

Confirm with the user that these seams match their expectations before writing the PRD.

### 3. Write the PRD

Fill in the template below. Use the project's own terminology throughout, and respect the conventions and design decisions you loaded in Step 1. Give the PRD a title; when `docs/PRD.md` exists, record which product goal the feature serves in the header field so the downstream agent sees the link.

<prd-template>

# <Feature title>

**Serves product goal:** <the goal from `docs/PRD.md` this advances, or "n/a" if there is no product PRD>

## Problem Statement

The problem that the user is facing, from the user's perspective.

## Solution

The solution to the problem, from the user's perspective.

## User Stories

A LONG, numbered list of user stories. Each user story should be in the format of:

1. As an <actor>, I want a <feature>, so that <benefit>

<user-story-example>
1. As a mobile bank customer, I want to see balance on my accounts, so that I can make better informed decisions about my spending
</user-story-example>

This list of user stories should be extremely extensive and cover all aspects of the feature.

## Implementation Decisions

A list of implementation decisions that were made. This can include:

- The modules that will be built/modified (name them; respect the boundaries in `docs/ARCHITECTURE.md`)
- The interfaces of those modules that will be modified
- Technical clarifications from the developer
- Architectural decisions, and the recorded design decisions / ADRs they extend or are constrained by
- Schema changes
- API contracts
- Specific interactions

Do NOT include specific file paths or code snippets. They may end up being outdated very quickly.

Exception: if a prototype produced a snippet that encodes a decision more precisely than prose can (state machine, reducer, schema, type shape), inline it within the relevant decision and note briefly that it came from a prototype. Trim to the decision-rich parts — not a working demo, just the important bits.

## Testing Decisions

A list of testing decisions that were made. Include:

- A description of what makes a good test (only test external behavior, not implementation details)
- Which modules will be tested, and the seams chosen in Step 2
- Prior art for the tests (similar tests in the codebase or in `docs/FEATURES.md`), and the testing rules from `docs/CONVENTIONS.md` that apply
- Any `docs/PITFALLS.md` gotcha the tests must guard against

## Out of Scope

A description of the things that are out of scope for this PRD.

## Further Notes

Any further notes about the feature.

</prd-template>

### 4. Publish the PRD

A tracker counts as **configured** only when the project explicitly opts in: a tracker + triage-label vocabulary left by a setup skill (e.g. `/setup-matt-pocock-skills`), a `.github` issue template meant for agent work, or the user naming a tracker in the conversation. A bare GitHub remote with default issues enabled is **not** enough — default to the local file path below.

- **Tracker configured:** publish the PRD there and apply the `ready-for-agent` triage label — no further triage needed. Keep the issue URL for Step 5.
- **No tracker** (the typical `project-initializer` project — local git only): write the PRD to `docs/prds/<slug>.md`, creating the `docs/prds/` folder if missing. `<slug>` is a short kebab-case feature name. If that file already exists, pick a more specific slug or ask whether to overwrite — never silently clobber an existing PRD. Start the file with a `status: ready-for-agent` YAML frontmatter so it carries the same ready signal the tracker label would. This file *is* the work item; keep its path for Step 5.

### 5. Register the work in the living docs

Only if the project has these files — skip silently otherwise, and never edit `docs/PRD.md`:

- `docs/ROADMAP.md` — add the feature as planned in the appropriate phase (you read the phases in Step 1), linking the PRD (issue URL or `docs/prds/<slug>.md`).
- `docs/FEATURES.md` — add a `status: planned` entry, linking the same PRD.

Link the PRD from both; don't copy the spec into them. Leave `docs/PRD.md` and `docs/SUMMARY.md` untouched — and let statuses advance to in-progress / shipped (and any `docs/EVENTS.md` entry land) through the project's normal doc maintenance when the feature is actually built. That's out of scope here.
