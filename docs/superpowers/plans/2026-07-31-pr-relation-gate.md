# PR Relation Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `linear-flow` ask whether a pull request **resolves**, **contributes to**, or is merely **related to** a Linear issue before attaching it, record that answer in the link title, and use it as a ceiling on the status move it proposes.

**Architecture:** The taxonomy lives once in a new plugin-root reference, `plugins/linear-flow/references/pr-relations.md`. Three skills gain a one- or two-sentence hook that points at it: `ln-ship-loop` (the primary PR path), `ln-issue-lifecycle` (a directly requested PR link), and `ln-project-lifecycle` (which routes a PR to an issue under the project). No skill restates the taxonomy — that is the repo's rule for a file two or more skills share, and copies drift on the first edit.

**Tech Stack:** Markdown (`SKILL.md`, references), JSON (`plugin.json`, `marketplace.json`, `evals.json`). No runtime, no build, no test framework.

**Source spec:** [`docs/superpowers/specs/2026-07-31-pr-relation-gate-design.md`](../specs/2026-07-31-pr-relation-gate-design.md) (committed as `2e0d854`).

**Branch:** `feat/pr-relation-gate` — already created and checked out. Do not create another.

## Global Constraints

- **There is no test framework.** The verification gate for every task is, in this order:
  `python3 scripts/check_compliance.py` then `claude plugin validate ./plugins/linear-flow`.
  Both must pass. Run them from the repo root, `/Users/mac/GitHub/claude-marketplace`.
- **`check_compliance.py` hard-fails** on: a dead repo-relative link in any `SKILL.md`, a
  `plugin.json` ↔ `marketplace.json` version mismatch, missing `name`/`description` frontmatter,
  and a reserved marketplace-name prefix. It only *warns* on a `SKILL.md` over 20,000 bytes.
  Tasks 1 and 4 use these hard failures as genuine red steps.
- **The plugin names no Linear tools, ever.** Prefixes differ across server variants. Write
  capabilities as behavior ("where the session's Linear tools expose no way to link a URL to a
  project"), never as a tool name.
- **Status names are never hardcoded.** Refer to status *meanings* — "a started status", "a
  completed status" — because the workspace supplies its own set via
  `~/.claude/linear-conventions.md` or the bundled `references/conventions.md`.
- **`ln-ship-loop` stays read-only on the code side.** No step in this plan may make any skill
  edit a PR description, commit, push, open, or merge anything.
- **A plugin's version lives in two files.** `plugins/linear-flow/.claude-plugin/plugin.json`
  and the `linear-flow` entry in `.claude-plugin/marketplace.json` must always match.
- **Conventional Commits**, scope `linear-flow`. No AI attribution, co-author trailers, or
  generated-with footers in any commit message.
- **Use the middle dot `·`** (U+00B7) as the separator in link titles, exactly as written.

---

### Task 1: The shared taxonomy, wired into `ln-ship-loop`

The reference file and its first consumer land together — the dead-link check is what proves the
wiring is real, so splitting them would leave one half unverifiable.

**Files:**
- Create: `plugins/linear-flow/references/pr-relations.md`
- Modify: `plugins/linear-flow/skills/ln-ship-loop/SKILL.md` (steps 4 and 5)
- Modify: `plugins/linear-flow/skills/ln-ship-loop/evals/evals.json` (append eval `id: 4`)

**Interfaces:**
- Consumes: nothing — this is the first task.
- Produces: the relative link path `../../references/pr-relations.md`, used verbatim from a
  `SKILL.md` inside `plugins/linear-flow/skills/<skill>/`. Tasks 2 and 3 reuse that exact
  string. It resolves because `check_compliance.py` joins the target onto `skill.parent`, which
  is the skill's own directory.
- Produces: the three answer labels **Resolves**, **Contributes**, **Related**, and the three
  link-title forms `Resolves · <PR title>`, `Contributes to · <PR title>`, `Related · <PR title>`.
  Tasks 2, 3 and 4 must use these spellings and no others.

- [ ] **Step 1: Write the failing check — add the link before the file exists**

Edit `plugins/linear-flow/skills/ln-ship-loop/SKILL.md`. Replace this line exactly:

```markdown
4. **Attach the PR** to the issue as a link. Attach only that; do not paste the diff or a generated summary into the description.
```

with:

```markdown
4. **Ask what the PR is to the issue** — resolves it, contributes to it, or is merely related to it — then attach it as a link **titled with that answer**. Attach only the link; do not paste the diff or a generated summary into the description. The three answers, their wording, and the project case: [`../../references/pr-relations.md`](../../references/pr-relations.md).
```

- [ ] **Step 2: Run the gate to verify it fails**

Run: `python3 scripts/check_compliance.py`

Expected: FAIL, with a line reading

```
FAIL: plugins/linear-flow/skills/ln-ship-loop/SKILL.md: dead repo-relative link -> ../../references/pr-relations.md
```

If it passes instead, the link text was not inserted — go back to Step 1.

- [ ] **Step 3: Create the reference that satisfies the link**

Create `plugins/linear-flow/references/pr-relations.md` with exactly this content:

````markdown
# What a pull request is to an issue

Before attaching a pull or merge request link to a Linear issue, ask which of three things it
is. The answer is written into the link title and **caps** how far a status move may be
proposed.

| Answer | Means | Link title | Status ceiling |
|---|---|---|---|
| **Resolves** | Merging this PR completes the issue. | `Resolves · <PR title>` | May propose the workspace's completed or near-delivery status. |
| **Contributes** | Real progress toward the issue; work remains. | `Contributes to · <PR title>` | May propose a started status. **Never** a completed one. |
| **Related** | Context only; the issue is not advanced by this PR. | `Related · <PR title>` | **No** status move proposed. |

The ceiling never *forces* a move. "Resolves" permits proposing completion; it does not make
completion automatic, and the move is still shown and approved like any other.

## Asking

One question, three answers, shown with **both** the PR title and the resolved issue title — a
mis-matched issue has to be visible before the write, not discovered after it.

Mark a recommended answer only when the evidence is unambiguous: the branch or PR title carries
the issue identifier **and** the PR covers the whole of what the issue asks for. Otherwise ask
plainly, with no steer. A recommendation is never applied without the answer.

Already recorded for this PR and this issue? Read it and propose the change as a diff — what it
says now, what it would say.

## Projects

A PR attaches to an issue. Where the session's Linear tools expose no way to link a URL to a
project, say so plainly, state that the project sees the PR through an issue, and ask which
issue under that project the PR delivers — offering to create one drafted from the PR if none
fits. Then ask the question above against that issue. Never write the PR URL into the project
description as a workaround.

## Linear's own magic words — documented, never written

Linear acts on a relation only when a magic word appears in the **pull request description**,
which these skills never edit. Linear has two buckets, not three:

- **Closing** — `close`, `fix`, `resolve`, `complete`, `implement` and their inflections.
  Automates the issue's status on merge.
- **Contributing** — `ref`, `references`, `part of`, `related to`, `contributes to`, `towards`.
  Links without automating.

So **Resolves** corresponds to the closing bucket, while **Contributes** and **Related** both
fall in the contributing one. When the user wants Linear's own merge automation, offer them the
exact line to paste into their PR description themselves — never edit the PR to add it.
````

- [ ] **Step 4: Run the gate to verify it passes**

Run: `python3 scripts/check_compliance.py`

Expected: PASS — no `FAIL:` line mentioning `pr-relations.md`.

- [ ] **Step 5: Add the status ceiling to step 5**

Edit `plugins/linear-flow/skills/ln-ship-loop/SKILL.md`. Replace this line exactly:

```markdown
5. **Propose the status move** that matches the code, expressed in the workspace's own statuses and meanings. Show current → proposed and the evidence for it. **Move only on approval.**
```

with:

```markdown
5. **Propose the status move** that matches the code, expressed in the workspace's own statuses and meanings and **bounded by step 4's answer** — a PR that only contributes cannot justify a completed status, and one that is merely related justifies no move at all. Show current → proposed and the evidence for it. **Move only on approval.**
```

- [ ] **Step 6: Add the eval that specifies the new behavior**

Edit `plugins/linear-flow/skills/ln-ship-loop/evals/evals.json`. Insert a comma after the
closing brace of the eval with `"id": 3`, then add this object before the closing `]`:

```json
    {
      "id": 4,
      "name": "asks-pr-relation-before-attaching-and-caps-status",
      "prompt": "PR is up for this branch — attach it to ABC-123 and update the status",
      "expected_output": "Before attaching anything, should ask what the PR is to ABC-123 — resolves it, contributes to it, or is merely related to it — showing both the PR title and ABC-123's own title so a mis-matched issue is visible before the write, and marking a recommended answer ONLY when the branch or PR title carries the identifier AND the PR covers the whole of what the issue asks for. Should title the link with that answer (e.g. \"Contributes to · <PR title>\"), then bound the status proposal by it: a contributing PR may reach a started status but never a completed one, and a merely related PR justifies no move at all. Must still show current -> proposed with its evidence and move only on approval. Must NOT edit the PR description to add a magic word, and must NOT treat \"resolves\" as permission to move without approval.",
      "files": []
    }
```

- [ ] **Step 7: Run both gates**

Run:

```bash
python3 scripts/check_compliance.py
claude plugin validate ./plugins/linear-flow
```

Expected: compliance reports no failures (size warnings are fine and do not block); `claude plugin validate` reports the plugin valid.

If `evals.json` fails to parse, the most likely cause is a missing or doubled comma after the
`"id": 3` object — check that first.

- [ ] **Step 8: Commit**

```bash
git add plugins/linear-flow/references/pr-relations.md \
        plugins/linear-flow/skills/ln-ship-loop/SKILL.md \
        plugins/linear-flow/skills/ln-ship-loop/evals/evals.json
git commit -m "feat(linear-flow): ask what a PR is to an issue before attaching it

Add the resolves/contributes/related taxonomy as a shared plugin-root
reference and wire it into ln-ship-loop: the ask precedes the attach, the
answer titles the link, and it caps how far step 5 may propose a status
move. A contributing PR cannot justify a completed status; a merely
related one justifies no move."
```

---

### Task 2: `ln-issue-lifecycle` — a PR link is not an ordinary link

**Files:**
- Modify: `plugins/linear-flow/skills/ln-issue-lifecycle/SKILL.md` (the *Sub-issues and links* bullet, in the `## Editing` section)
- Modify: `plugins/linear-flow/skills/ln-issue-lifecycle/evals/evals.json` (append eval `id: 4`)

**Interfaces:**
- Consumes: `../../references/pr-relations.md` and the three answer labels from Task 1.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Extend the links bullet**

Edit `plugins/linear-flow/skills/ln-issue-lifecycle/SKILL.md`. Replace this line exactly:

```markdown
- **Sub-issues and links** — breaking an issue up means the parent keeps the outcome and the children hold the work; propose the whole split at once, not one child at a time. Attaching to a project or milestone is an edit like any other: show it, confirm it.
```

with:

```markdown
- **Sub-issues and links** — breaking an issue up means the parent keeps the outcome and the children hold the work; propose the whole split at once, not one child at a time. Attaching to a project or milestone is an edit like any other: show it, confirm it. A **pull or merge request** is not: ask first what it is to the issue — resolves, contributes to, or merely related — and title the link with the answer ([`../../references/pr-relations.md`](../../references/pr-relations.md)).
```

- [ ] **Step 2: Run the compliance gate to confirm the new link resolves**

Run: `python3 scripts/check_compliance.py`

Expected: PASS. The reference exists from Task 1, so no dead-link failure should appear. If one
does, Task 1 was not completed or was reverted — stop and check.

- [ ] **Step 3: Add the eval**

Edit `plugins/linear-flow/skills/ln-issue-lifecycle/evals/evals.json`. Insert a comma after the
closing brace of the eval with `"id": 3`, then add this object before the closing `]`:

```json
    {
      "id": 4,
      "name": "pr-link-asks-relation-other-links-do-not",
      "prompt": "Attach this PR to ABC-123: https://github.com/acme/api/pull/412",
      "expected_output": "Should fetch ABC-123 and show its title back so a mistyped identifier cannot silently retarget the write, then — because the link is a pull request — ask whether it resolves, contributes to, or is merely related to the issue BEFORE writing, and title the link with that answer. A non-PR link such as a design doc or a Slack thread takes no such question and is attached as a plain confirmed edit. If a relation is already recorded for this PR and this issue, should read it and propose the change as a diff, current -> proposed, rather than silently overwriting it.",
      "files": []
    }
```

- [ ] **Step 4: Run both gates**

Run:

```bash
python3 scripts/check_compliance.py
claude plugin validate ./plugins/linear-flow
```

Expected: no failures; plugin valid.

- [ ] **Step 5: Commit**

```bash
git add plugins/linear-flow/skills/ln-issue-lifecycle/SKILL.md \
        plugins/linear-flow/skills/ln-issue-lifecycle/evals/evals.json
git commit -m "feat(linear-flow): gate PR links in ln-issue-lifecycle

A directly requested PR link now takes the relation question before the
write, like the ship-loop path. Other link types are untouched — a design
doc or a Slack thread stays a plain confirmed edit."
```

---

### Task 3: `ln-project-lifecycle` — route a PR to an issue

**Files:**
- Modify: `plugins/linear-flow/skills/ln-project-lifecycle/SKILL.md` (append to the `## Updating` section, before `## Milestones and status updates`)
- Modify: `plugins/linear-flow/skills/ln-project-lifecycle/evals/evals.json` (append eval `id: 4`)

**Interfaces:**
- Consumes: `../../references/pr-relations.md` and the three answer labels from Task 1.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the routing paragraph**

Edit `plugins/linear-flow/skills/ln-project-lifecycle/SKILL.md`. Find this line, which is the
last line of the `## Updating` section:

```markdown
Rewriting a description **preserves what is still true**. A scope change is an edit to the Scope section, not a regenerated document.
```

Insert immediately after it (leaving one blank line between the two paragraphs):

```markdown
**A pull request is not a project edit.** A PR attaches to an issue; the project sees it through that issue. Route it per [`../../references/pr-relations.md`](../../references/pr-relations.md).
```

- [ ] **Step 2: Run the compliance gate to confirm the new link resolves**

Run: `python3 scripts/check_compliance.py`

Expected: PASS, no dead-link failure for `ln-project-lifecycle`.

- [ ] **Step 3: Add the eval**

Edit `plugins/linear-flow/skills/ln-project-lifecycle/evals/evals.json`. Insert a comma after
the closing brace of the eval with `"id": 3`, then add this object before the closing `]`:

```json
    {
      "id": 4,
      "name": "pr-link-on-a-project-routes-to-an-issue",
      "prompt": "Attach this PR to the billing revamp project",
      "expected_output": "Should NOT attach the PR to the project where the session's Linear tools expose no way to link a URL to one. Should say so plainly, state that a PR attaches to an issue and the project sees it through that issue, and ask which issue under the billing revamp project the PR delivers — offering to create one drafted from the PR if none fits. Once an issue is chosen, the resolves / contributes / related question runs against that issue and titles the link. Must NOT write the PR URL into the project description as a workaround, and must NOT report a project-side link that no tool result confirms.",
      "files": []
    }
```

- [ ] **Step 4: Run both gates**

Run:

```bash
python3 scripts/check_compliance.py
claude plugin validate ./plugins/linear-flow
```

Expected: no failures; plugin valid.

- [ ] **Step 5: Commit**

```bash
git add plugins/linear-flow/skills/ln-project-lifecycle/SKILL.md \
        plugins/linear-flow/skills/ln-project-lifecycle/evals/evals.json
git commit -m "feat(linear-flow): route project PR links through an issue

Linear models a project link, but not every MCP server exposes one. Rather
than dead-ending or faking project-side state, ln-project-lifecycle now
says so and asks which issue under the project the PR delivers — where the
relation question then runs."
```

---

### Task 4: Version bump and living docs

The version bump is the repo's single most-repeated failure mode (`docs/PITFALLS.md`,
2026-06-26). Step 1 reproduces it deliberately so the gate is seen catching it.

**Files:**
- Modify: `plugins/linear-flow/.claude-plugin/plugin.json:3` (`"version": "0.1.0"` → `"0.2.0"`)
- Modify: `.claude-plugin/marketplace.json:81` (the `linear-flow` entry's `"version"`)
- Modify: `docs/FEATURES.md:3`, `docs/FEATURES.md:87`, `docs/FEATURES.md:89`, `docs/FEATURES.md:91`
- Modify: `docs/STACK.md:32`

**Interfaces:**
- Consumes: the answer labels and the reference path from Task 1; the behavior described in
  Tasks 2 and 3.
- Produces: nothing — this is the last task.

- [ ] **Step 1: Bump only `plugin.json`, to see the drift check fire**

Edit `plugins/linear-flow/.claude-plugin/plugin.json`. Change `"version": "0.1.0"` to
`"version": "0.2.0"`. Change nothing else, and do **not** touch `marketplace.json` yet.

- [ ] **Step 2: Run the gate to verify it fails**

Run: `python3 scripts/check_compliance.py`

Expected: FAIL, with a line reading

```
FAIL: plugin `linear-flow`: version drift — marketplace.json 0.1.0 != plugin.json 0.2.0
```

- [ ] **Step 3: Bump the catalog entry to match**

Edit `.claude-plugin/marketplace.json`. In the object whose `"name"` is `"linear-flow"`, change
`"version": "0.1.0"` to `"version": "0.2.0"`. Leave every other plugin's version alone.

- [ ] **Step 4: Run the gate to verify it passes**

Run: `python3 scripts/check_compliance.py`

Expected: PASS — the drift line is gone and no other `FAIL:` line appears.

- [ ] **Step 5: Update `docs/FEATURES.md` — the counts line**

Replace this text on line 3:

```markdown
Eleven plugins ship 61 skills between them: ten are at `0.1.0` and `project-initializer` is at `0.2.0`.
```

with:

```markdown
Eleven plugins ship 61 skills between them: nine are at `0.1.0`, and `project-initializer` and `linear-flow` are at `0.2.0`.
```

- [ ] **Step 6: Update `docs/FEATURES.md` — the linear-flow behavior sentence**

On line 87, replace this fragment (it appears once, inside the long `**Behavior:**` bullet):

```markdown
`ln-ship-loop` reads branch, commits, and PR to find or create the matching issue, attach the PR, and propose the status move — it never commits, pushes, or opens PRs.
```

with:

```markdown
`ln-ship-loop` reads branch, commits, and PR to find or create the matching issue, attach the PR, and propose the status move — it never commits, pushes, or opens PRs. Attaching a PR anywhere in the plugin first asks what it *is* to the issue — resolves, contributes to, or merely related — which titles the link and caps how far the status proposal may go; a project PR routes to an issue under it, since not every MCP server exposes a project link.
```

- [ ] **Step 7: Update `docs/FEATURES.md` — the implementation and status lines**

On line 89, replace:

```markdown
plugin-root `references/{conventions,linear-mcp}.md`
```

with:

```markdown
plugin-root `references/{conventions,linear-mcp,pr-relations}.md`
```

Then on line 91, replace:

```markdown
- **Status:** shipped at `0.1.0`.
```

with:

```markdown
- **Status:** shipped at `0.2.0` (gained the PR relation gate).
```

- [ ] **Step 8: Update `docs/STACK.md` — the versions paragraph**

On line 32, replace:

```markdown
Every plugin sits at **`0.1.0`** in both its `plugin.json` and `marketplace.json` entry, except `project-initializer` at **`0.2.0`** (it gained a second skill, `update-for-model`).
```

with:

```markdown
Every plugin sits at **`0.1.0`** in both its `plugin.json` and `marketplace.json` entry, except `project-initializer` and `linear-flow`, both at **`0.2.0`** (`project-initializer` gained a second skill, `update-for-model`; `linear-flow` gained the PR relation gate).
```

- [ ] **Step 9: Run both gates one final time**

Run:

```bash
python3 scripts/check_compliance.py
claude plugin validate .
claude plugin validate ./plugins/linear-flow
```

Expected: no failures anywhere; both the marketplace and the plugin report valid. Note this run
includes `claude plugin validate .` for the marketplace manifest, because Task 4 edited it.

- [ ] **Step 10: Confirm no stale count survived**

Run: `grep -n "shipped at" docs/FEATURES.md`

Expected: the `linear-flow` entry reads ``shipped at `0.2.0` `` and `project-initializer` reads
``shipped at `0.2.0` ``; every other plugin still reads `0.1.0`. Do not grep for the bare string
`0.1.0` near `linear-flow` — the rewritten `STACK.md` line legitimately contains both, and would
false-positive.

- [ ] **Step 11: Commit**

```bash
git add plugins/linear-flow/.claude-plugin/plugin.json \
        .claude-plugin/marketplace.json \
        docs/FEATURES.md docs/STACK.md
git commit -m "chore(linear-flow): bump to 0.2.0 for the PR relation gate

Version bumped in both plugin.json and the marketplace entry together.
FEATURES.md and STACK.md updated for the new behavior, the new plugin-root
reference, and the version counts."
```

---

## Verification of the whole change

After Task 4, from the repo root:

```bash
python3 scripts/check_compliance.py
claude plugin validate .
claude plugin validate ./plugins/linear-flow
git log --oneline main..HEAD
```

Expect four commits on top of the spec commit `2e0d854`, all gates green. Show the gate output
as evidence rather than asserting it passed.

Per `docs/CONVENTIONS.md`, run the bundled `/code-review` before treating this as done. That
step is a deliberate, documented deviation from the Opus 5 guidance in `docs/MODEL-NOTES.md` —
keep it.

## Out of scope

- Writing magic words into PR descriptions. Documented in the new reference; never automated.
- Capability detection for MCP servers that *do* expose a project link. The routing fallback is
  the only path for now.
- The `disable-model-invocation` question for the five `ln-*` skills — tracked in
  `docs/ROADMAP.md`, not here.
- `~/.claude/linear-conventions.md`. It is a user file outside this repo and this change needs
  nothing from it.
