---
status: implemented
---

# Living-docs lessons for `project-initializer`, and a `refresh-docs` skill

**Serves product goal:** "All skills and plugins in this repo MUST follow Claude Code best practices" ([CONVENTIONS.md](../CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows)). Here that goal applies to the plugin whose output is other projects' `CLAUDE.md` and living docs, which load into every session of those projects.

> **Basis.**
>
> - **The comparison.** What `project-initializer` `0.2.1` generates, set against one project that used that output for real: Linkeza (`/Users/mac/GitHub/linkeza`, read only, 2026-10-26). Linkeza `path:line` citations are relative to that repo.
> - **Claude Code behavior** comes from <https://code.claude.com/docs/en/memory> and <https://code.claude.com/docs/en/plugin-evals>, both fetched 2026-10-26.
> - **Out of scope:** all Linkeza-specific values (product rules, supply-chain columns, startup decision gates), and everything the separate `agent-operating-model` spec owns. That spec is `docs/prds/agent-operating-model.md`, still uncommitted in the main checkout when this was written. Its decision D1 makes it a separate plugin with no dependency on this one, and it owns `OPERATING-MODEL.md`, `.claude/agents/`, the CEO, lead and specialist roles, model and effort rules, and the rules for subagent briefs.
> - **Decisions Q1–Q18** were taken with the owner on 2026-10-26 and 2026-10-27, one question at a time. A read-only Opus review then checked this spec, and its findings are folded in below.

## Problem Statement

**Imports.** The skill generates a `CLAUDE.md` that `@`-imports all nine living docs. Claude Code expands every import at launch, and the memory docs say plainly: "Imports help you organize a long file but don't reduce its context cost".

The same page sets two size rules:

- a target of under 200 lines per `CLAUDE.md`, where "each CLAUDE.md, rules file, and `@path` import counts as a separate file";
- a startup warning when files "add up past a combined limit". The page gives no number for that limit.

**What that did to Linkeza.** Its imported set grew to about 250 KB, roughly 60k tokens. That is part of a fixed base of about 195k tokens that starts every model call; the rest of the base is tools, MCP servers and skills. That base was about 64% of all tokens spent (`docs/OPERATING-MODEL.md:170`).

**A cut by hand, and its cost.** The fix was manual. Commit `56bc961` cut `PITFALLS.md` from 105 KB to 36 KB, and that cut dropped the constraints of five entries. Commit `bfe31e2` had to restore them.

**Structure the skill never generates.** Linkeza grew generic structure the skill does not produce:

- hard constraints at the top of `AGENTS.md`;
- a status line for built versus designed;
- feature status linked to the feature's PRD;
- a checkable "done when" per phase;
- pins with a reason;
- a conventions table with one row per scope.

**Two problems in the skill itself.** It duplicates the documentation-maintenance map into `CONVENTIONS.md`. And `SKILL.md` is already over the repo's 20,000-byte budget, at 20,509 B.

**No help for existing projects.** The plugin covers new projects only. Nothing in it helps a project whose docs already exist and have drifted.

## Gap analysis

| Linkeza practice | Skill today | Verdict |
|---|---|---|
| `CLAUDE.md` imports 10 docs (~250 KB) | Imports all 9 (+ `EVENTS.md`) | **Change:** import only the core, link the rest (Q1) |
| `PITFALLS.md`: one rule per entry, linked to a `PITFALLS-HISTORY.md` that nothing imports | One file, free-form entries | **Adopt** from day one (Q2) |
| No size target (the cut came after the cost appeared) | None | **Add** the 200-line target for each imported file (Q3) |
| Maintenance map copied into `CONVENTIONS.md` | Asks for the copy (`TODO: Lift the same map`) | **Change:** keep it in one place; the other file links to it (Q4) |
| "Where conventions live", one row per scope + "a scope's file wins" | Per-scope files, generic table | **Adopt** the filled table and the sentence (Q5) |
| `ARCHITECTURE.md` status blockquote (built vs designed) | None | **Adopt**, kept to one line (Q6) |
| `FEATURES` block with **PRD:** + fixed status; `ROADMAP` **Done when:** | Status word only | **Adopt** the core; the sequential gate is optional; decision-gates table stays out (Q7, Q18) |
| `STACK` pins table (7 columns) + evolution triggers | Free prose | **Adopt** `Package · Version · Why` + one pin-policy line (Q8) |
| `AGENTS` hard constraints; tree with planned vs existing; `SUMMARY` dated status | None | **Adopt** all three (Q9) |
| Lessons applied by hand to an existing repo | Out of scope ("Do NOT use for updating docs in established projects") | **New skill `refresh-docs`**; the initializer stays new-project-only (Q10–Q14) |

Linkeza abandoned nothing the skill generates. Every divergence is growth the skill did not anticipate. Linkeza still imports all of its docs, so the core-only import rule (Q1) is an inference from the official docs plus Linkeza's measured cost. It is not a pattern Linkeza has proven.

## Proposals

### P1 — Shared doc formats move to plugin-root `templates/` (Q12)

Create `plugins/project-initializer/templates/` with one file per generated doc. The eleven files are `claude-md.md`, `agents-md.md`, `conventions.md`, `pitfalls.md`, `pitfalls-history.md`, `architecture.md`, `features.md`, `roadmap.md`, `stack.md`, `summary.md` and `prd.md`.

- **Contents:** each file holds its doc's skeleton and format rules, together with the verbatim blocks the skill uses today: the `CLAUDE.md` file, the Documentation maintenance section, and the `CONVENTIONS.md` header.
- **Who links them:** the `project-initializer` and `refresh-docs` skills link the templates as Markdown links `[…](../../templates/<file>.md)`, which is the form `check_compliance.py` checks. `update-for-model` does not use them. The pattern is the repo's rule for a file that two skills share ([CONVENTIONS.md › Languages and code style](../CONVENTIONS.md#languages-and-code-style)).
- **What stays in `project-initializer/SKILL.md`:** the process (survey, event-broker detection, skip-and-report, cross-linking, git, report), the diagramming policy, the Rules checklist, and pointers to the templates.
- **What stays where it is:** `templates/generate-events-catalog.md` remains skill-local, because only the initializer uses it.

### P2 — Format changes the initializer generates

1. **`CLAUDE.md` imports only the core (Q1, Q16).** The "Living documentation" list `@`-imports `AGENTS.md`, `docs/CONVENTIONS.md` and `docs/PITFALLS.md`. The other living docs, `docs/EVENTS.md` included, are plain Markdown links on the same list. A visible Markdown sentence above the list says why: imports load in full at every launch. Use a sentence, not an HTML comment, because comments are stripped before injection.

   `docs/MODEL-NOTES.md` belongs to the core as well. It is never present at init time, though: `update-for-model` adds it with `@`, and that skill stays unchanged. The SKILL.md line that today adds `@docs/EVENTS.md` (SKILL.md:276) becomes a plain link.
2. **Size target (Q3).** The generated `CONVENTIONS.md` states the rule: each file that `CLAUDE.md` imports stays under 200 lines, the memory docs' target, which counts every import as its own file. Detail beyond that moves to a file nothing imports. If an imported file's short form still passes 200 lines, split it by topic into files that are not imported, and keep an index of them in the imported file.

   The skill counts the lines of the files it generated before it reports. It also tells the user that Claude Code's combined-size warning at startup and in `/status` is the check for the whole set.
3. **`PITFALLS.md` + `PITFALLS-HISTORY.md` (Q2).**
   - `PITFALLS.md`: each entry is a heading, its rule in 1–3 lines, and a link to `PITFALLS-HISTORY.md#<anchor>`.
   - `PITFALLS-HISTORY.md`: the full story under the same heading (symptom, cause, fix, dates). Nothing imports it.
   - The template states the invariant that `bfe31e2` had to restore. A rule that loses its constraint is wrong, so the short form keeps every "never" and "must".
4. **One maintenance map (Q4).** The map stays verbatim in `AGENTS.md` § Documentation maintenance and gains four lines:
   - Discovered a gotcha → rule in `PITFALLS.md`, story in `PITFALLS-HISTORY.md`.
   - New feature PRD → `docs/prds/<slug>.md`, registered in `FEATURES.md` and `ROADMAP.md`.
   - Code built that was designed → update the status line in `ARCHITECTURE.md`.
   - Priorities or status changed → update the status line in `SUMMARY.md`.

   `CONVENTIONS.md` § Documentation maintenance becomes one line that links to the map.
5. **Scoped conventions (Q5).** In a monorepo, the root "Where conventions live" table gets one row per scope created, `| <Scope> | <dir>/docs/CONVENTIONS.md |`. The row uses the scope directory as the survey found it (`infra/` or `infrastructure/`). After the table comes the sentence "A scope's file wins over this one for that scope when they conflict." Only the root file is imported.
6. **`ARCHITECTURE.md` status line (Q6).** The file always opens, under its title, with `> **Status (YYYY-MM-DD):** built: …; designed, not built: …`. It is one line, and line 3 of the P2.4 map keeps it current. Each diagram already carries a "Constraints:" list under it; that is existing policy.
7. **`FEATURES.md` and `ROADMAP.md` (Q7, Q18).**
   - `FEATURES.md`: each feature block has **Purpose / Behavior / Implementation / PRD / Status**. Status is exactly one of `planned`, `in-progress` or `shipped`, plus a date.
   - `ROADMAP.md`: each phase heading carries its status, and each phase ends with a checkable **Done when:** line.
   - The sentence "Each phase starts only when the previous phase's gate is met" goes in only when the user says, during the survey, that the phases are sequential.
8. **`STACK.md` pins (Q8).** A `| Package | Version | Why |` table, filled from the manifests the survey read, plus one line of pin policy. That line is a TODO when no policy can be inferred.
9. **`AGENTS.md` and `SUMMARY.md` (Q9).**
   - `AGENTS.md` gets `## Hard constraints` right after the overview: a short numbered list of the rules that override every other consideration. The items come from the survey or the user's answers, never invented; when none are known, the section holds a TODO. The template gives an example lead-in and no fixed count.
   - The repository tree in `AGENTS.md` marks planned paths `(planned)`. It is not derivable from the code, so it stays even when `/doctor` proposes cutting directory layouts.
   - `SUMMARY.md` gets a `**Status (YYYY-MM-DD):**` line and a numbered list of top priorities.

The trigger and skip-and-report stay as they are, and so does "new projects only" (Q10). SKILL.md:148 and the description's "Do NOT use for updating docs in established projects" now point at `refresh-docs`.

### P3 — New skill `refresh-docs` (Q10–Q14)

`plugins/project-initializer/skills/refresh-docs/SKILL.md` reviews the living docs of an **existing** project and proposes changes.

**Trigger (Q14).** Explicit requests only, without `disable-model-invocation`. The description names concrete phrases, such as "refresh the living docs", "review our AGENTS.md and docs", "our CLAUDE.md is too big" and `/refresh-docs`. It also names three cases where the skill must not fire: re-tuning for a model (`update-for-model`), a project with no living docs (`project-initializer`), and a single edit the user has already dictated.

**Three lenses (Q11).** The skill runs the format and drift lenses without waiting. It asks for the content report and folds that report in when it arrives.

1. **Format:** the P2 rules, read from `../../templates/`. It flags:
   - imports beyond the core;
   - imported files over 200 lines;
   - a PITFALLS file that was never split;
   - missing status lines;
   - a duplicated maintenance map;
   - a scope table that disagrees with the scoped files on disk.

   It leaves alone any import that belongs to another plugin, such as `@docs/OPERATING-MODEL.md`.
2. **Drift:** claims the repo contradicts. Examples are a path the docs cite that does not exist, a `STACK.md` version that differs from the manifest, a feature marked `planned` whose code exists, and a scope-table row with no file behind it.
3. **Content (Q13):** the skill asks the user to run `/doctor prompt-audit` and `/doctor prompt-audit docs/`, or reads a report the user already pasted, and then triages it against the project. Its own judgment covers only what those reports do not, such as contradictions between a doc and `CONVENTIONS.md`.

**Apply gate (Q11).** The skill produces one report (finding → proposed change → why), then one batch of edits. It writes nothing until the user approves, and partial approval is allowed. A PITFALLS split moves the full text verbatim to `PITFALLS-HISTORY.md`, a new file. That file is the only exception to the boundary below against creating files. Each rule that is kept is checked against its story, so that no constraint is lost.

**Boundaries.**

- It never edits `docs/MODEL-NOTES.md` and never proposes model tuning; both belong to `update-for-model`.
- It does not scaffold other missing living docs. It reports them and points at `project-initializer`.
- It leaves `OPERATING-MODEL.md`, `.claude/agents/` and model or effort rules alone; those belong to `agent-operating-model`.

### P4 — Manifests and repo docs (Q15)

- Plugin version goes from `0.2.1` to `0.3.0` in `plugin.json` and in the `marketplace.json` entry. The new description is identical in both and covers scaffold, refresh and re-tune. Add the keyword `refresh`.
- Version and skill count must change in these places:
  - `docs/FEATURES.md`: the intro's version list and skill count (61 → 62), and the project-initializer section, which gains the third skill and its status.
  - `docs/STACK.md` § Versions: the project-initializer entry and "61 skills".
  - `docs/ROADMAP.md`: a Phase 3 entry for `0.3.0`, and the Phase 2 count "all 61 skills" at line 27. The history lines stay as written.
  - `README.md`: the project-initializer table row.
  - `docs/ARCHITECTURE.md`: a plugin-root `templates/` line in the layout tree.
  - `docs/MODEL-NOTES.md` is **not** hand-edited ([AGENTS.md](../../AGENTS.md) › Documentation maintenance); its "61 descriptions" goes stale until `update-for-model` runs again.

### P5 — Evals (Q15)

Six cases go in `plugins/project-initializer/evals/<case>/`, following the repo's precedent:

- `prompt.md` carries the prompt and its frontmatter: `description`, `max_turns: 60`, `timeout_seconds: 900`, `allowed_tools`.
- Cases that need a workspace add a `case.yaml` with `schema_version: "1.1"`, `name`, and `context.scaffold_script: fixture.sh`.
- Graders are `regex` (on `last_message`, or on `{ source: file, path: … }` with `flags: m` for anchors), `file_exists` or `tool_used`. There are no long-reply `llm` judges ([PITFALLS.md](../PITFALLS.md) 2026-09-23).

| # | Case and prompt | Graders (scored; all must pass unless marked indicator) |
|---|---|---|
| 1 | `init-small-node-repo`. Scaffold: `package.json` (name, one dep) + `src/index.js` + `README.md` with a one-line purpose. Prompt: "init this project". | `CLAUDE.md` matches `@AGENTS\.md`, `@docs/CONVENTIONS\.md`, `@docs/PITFALLS\.md`. `CLAUDE.md` `not_contains` `@docs/(ARCHITECTURE\|FEATURES\|PRD\|ROADMAP\|STACK\|SUMMARY)`. `file_exists` `docs/PITFALLS-HISTORY.md`. `not_contains` `@(\./)?(docs/)?PITFALLS-HISTORY` on each of `CLAUDE.md`, `AGENTS.md`, `docs/CONVENTIONS.md`, `docs/PITFALLS.md`. `docs/ARCHITECTURE.md` matches `^> \*\*Status` (`flags: m`). `AGENTS.md` matches `^## Hard constraints` (`flags: m`). |
| 2 | `init-monorepo-scopes`. Scaffold: root `package.json` with workspaces, a `package.json` in `apps/web` and in `apps/api`, `infra/main.tf`. Prompt: "init this project". | `docs/CONVENTIONS.md` matches `apps/web/docs/CONVENTIONS\.md`, `apps/api/docs/CONVENTIONS\.md` and `infra(structure)?/docs/CONVENTIONS\.md`, plus `wins over this one`. `file_exists` for each of the three scoped files. |
| 3 | `refresh-bloated-docs`. Scaffold: an existing `CLAUDE.md` with 9 `@docs/*` imports, the matching docs, and a 300-line `docs/PITFALLS.md` of free-form entries. Prompt: "refresh the living docs". | Reply matches `PITFALLS-HISTORY` and a proposal to turn `@docs/(STACK\|ROADMAP\|FEATURES)` into links (regex on `last_message`, `flags: i`). `tool_used` `Edit`, `Write` and `Bash` each with `max: 0`. Indicator: `refresh-docs` fired. |
| 4 | `refresh-stack-drift`. Scaffold: living docs with `docs/STACK.md` saying `react` `18.2.0`; `package.json` pins `19.3.1`. Prompt: "review our AGENTS.md and docs". | Reply matches both `18\.2\.0` and `19\.3\.1`. Indicator: `refresh-docs` fired. |
| 5 | `negative-model-retune`. Scaffold: the case-4 docs. Prompt: "update the docs for Opus 5.5". | `tool_used` `Skill`, `input_match` `refresh-docs`, `min: 0`, `max: 0`, `arm: both`. |
| 6 | `negative-empty-repo-init`. No scaffold. Prompt: "init this project". | Same `refresh-docs` max-0 grader as case 5. Indicator: `project-initializer` fired. In an empty repo it asks for name and purpose, so nothing is graded on files. |

The "Indicator" rows are `Skill` `tool_used` graders, which a two-arm run leaves unscored.

> **Changed at build time (2026-10-27, owner's decision):** case 3's link grader is `(STACK|ROADMAP|FEATURES)[^\n]*link|link[^\n]*(STACK|ROADMAP|FEATURES)`, not the literal `@docs/(STACK|ROADMAP|FEATURES)`. In the first run the skill proposed the links correctly in every run but named the docs without the `@docs/` prefix, so the literal pattern was grading spelling, not the proposal.

Run them by hand, as every eval in this repo is run, on Claude Code ≥ 2.1.269:

```
claude plugin eval ./plugins/project-initializer --scaffold --trust-plugin --no-publish --allow-tools Write Edit "Bash(git *)"
```

The legacy `update-for-model/evals/evals.json` is not converted in this delivery.

## Acceptance criteria

Each line is checked by a command or a file read, and its output is shown as evidence.

- [ ] `python3 scripts/check_compliance.py` exits 0 and prints no size warning for `project-initializer/SKILL.md` or `refresh-docs/SKILL.md`.
- [ ] `claude plugin validate .` and `claude plugin validate ./plugins/project-initializer` pass.
- [ ] `git diff --stat main -- .github/workflows/validate.yml plugins/project-initializer/skills/update-for-model/` is empty.
- [ ] `plugin.json` and the `marketplace.json` entry both read `0.3.0`, with identical descriptions and the keyword `refresh`.
- [ ] `grep -n "0\.2\.1" docs/FEATURES.md docs/STACK.md README.md` shows only history clauses ("`0.2.1` moved its doc URLs…"), and `grep -n "61 skills" docs/FEATURES.md docs/STACK.md` returns nothing.
- [ ] `ls plugins/project-initializer/templates/` lists the eleven P1 files, and `grep -rc "TODO: Lift the same map" plugins/project-initializer` totals 0.
- [ ] `templates/claude-md.md`: `@` appears only before `AGENTS.md`, `docs/CONVENTIONS.md` and `docs/PITFALLS.md`. `docs/EVENTS.md` and the other six docs appear as Markdown links.
- [ ] One grep per rule confirms each P2 rule in its template:
  - the 200-line rule in `conventions.md`;
  - the "keep every never/must" invariant in `pitfalls.md`;
  - the four new map lines in `agents-md.md`;
  - the "wins over this one" sentence in `conventions.md`;
  - the `> **Status (` line in `architecture.md` and `summary.md`;
  - `**Done when:**` and the conditional gate sentence in `roadmap.md`;
  - `| Package | Version | Why |` in `stack.md`;
  - `## Hard constraints` and `(planned)` in `agents-md.md`.
- [ ] `project-initializer/SKILL.md` keeps Step 1.5, skip-and-report and the Rules checklist. It counts lines of the generated files before reporting, and its out-of-scope line names `refresh-docs`.
- [ ] `refresh-docs/SKILL.md` frontmatter has `name: refresh-docs`, a description of at most 1,024 characters that names the three Do-NOT cases, and no `disable-model-invocation`.
- [ ] `refresh-docs/SKILL.md` names the three lenses, the "run format and drift without waiting" rule, the write-nothing-before-approval gate, the verbatim history move as the one file it may create, and the three boundaries.
- [ ] The six P5 cases exist with the graders in the table. One by-hand run is recorded in the PR description with pass/fail per case. Read a failing case's `evidence` before blaming the skill.
- [ ] Every doc listed in P4 is updated in the same change, and `/code-review` has been run on the diff.

## Rejected

- **A retrofit mode inside `project-initializer`.** It would widen a trigger that is narrow on purpose, and enlarge a skill that is already over budget. The retrofit becomes its own skill instead (P3).
- **Linkeza's full formats.** That means STACK's licence, install-script and published-date columns, its evolution-triggers table, and ROADMAP's post-launch decision-gates table. They are supply-chain and startup policy, not generic structure.
- **A per-scope `CLAUDE.md`, or `.claude/rules/`, for scoped conventions (Q5).** Both are official on-demand mechanisms. Either one moves conventions out of `docs/`, and the root table already routes agents to the scoped files.
- **A fixed KB budget for the imported set (Q3).** The docs state a combined limit but give no number, so any number would be ours. The 200-line target per file is the official one, and Claude Code's own combined-size warning covers the total.
- **Making the size budget a hard CI failure (Q15).** It would touch all eleven plugins, so it belongs in another spec.
- **Turning `MODEL-NOTES.md` into a link to save tokens (Q16).** It is about 2k tokens, roughly 1% of Linkeza's base. Its rules matter exactly when an agent would not think to open it.

## Resolved questions

| # | Question | Decision |
|---|---|---|
| Q1 | How `CLAUDE.md` treats living docs | Core `@` imports; the rest are links |
| Q2 | PITFALLS split | From day one: rule in 1–3 lines + history file nothing imports |
| Q3 | Size target for imported docs | Under 200 lines per file (official), stated in `CONVENTIONS.md`, checked on generated files |
| Q4 | Duplicated maintenance map | Lives in `AGENTS.md`; `CONVENTIONS.md` links |
| Q5 | Monorepo conventions | Filled table + "a scope's file wins"; only the root file is imported |
| Q6 | ARCHITECTURE status | Always, one dated line |
| Q7 | FEATURES and ROADMAP status | Core only: feature block with PRD and fixed status; **Done when:** per phase |
| Q8 | STACK pins | `Package · Version · Why` + one pin-policy line |
| Q9 | AGENTS and SUMMARY | Hard constraints, tree with planned vs existing, dated status + priorities |
| Q10 | New projects only? | The initializer stays new-only; the retrofit is a new skill in this plugin (P3) |
| Q11 | How `refresh-docs` applies changes | Batch proposal, written only on approval, partial approval allowed |
| Q12 | Where shared formats live | Plugin-root `templates/`, which also brings `SKILL.md` under budget |
| Q13 | Content review vs `/doctor prompt-audit` | Uses the native report and triages it; judges only what it does not cover |
| Q14 | Name and trigger | `refresh-docs`; explicit phrases, no `disable-model-invocation` |
| Q15 | Version, evals, CI | `0.3.0` in both manifests; the six P5 cases; `validate.yml` unchanged; no size warning as the bar |
| Q16 | MODEL-NOTES import | Stays in the core |
| Q17 | Where this spec is committed | Branch `feat/living-docs-lessons` in the worktree, not `main`. This is a deliberate deviation from CONVENTIONS › Branching, so the build session starts from it |
| Q18 | Sequential phase gate (raised in review) | **Done when:** always; the gate sentence only when the user says phases are sequential |
