---
status: proposed
---

# agent-operating-model: set up a project's agent operating model

**Serves product goal:** "Distribute a curated set of Claude Code plugins from a single repo" ([PRD.md](../PRD.md#goals)). This is a new plugin, held to the [best-practices baseline](../CONVENTIONS.md#claude-code-best-practices-the-baseline-every-skill-follows).

> **Basis.** The reference is the operating model the owner runs in the Linkeza project (`/Users/mac/GitHub/linkeza`): `docs/OPERATING-MODEL.md`, 11 `lider-*` and 30 `especialista-*` agents in `.claude/agents/`, and two agent reviews in `docs/agent-reviews/` (2026-10-18, 2026-10-26). Its rules came out of those reviews. Claude Code facts were taken from the live [sub-agents](https://code.claude.com/docs/en/sub-agents), [plugins reference](https://code.claude.com/docs/en/plugins-reference) and [plugin evals](https://code.claude.com/docs/en/plugin-evals) pages, fetched 2026-10-26. Every design decision below was made by the owner in an interview on 2026-10-26 (D15–D16 after an independent review of the first draft) ([Decisions](#decisions)).

## Problem Statement

Linkeza's agent model works, but it lives in one repo and took two review rounds to get right. It has a CEO session, leads per area, specialists, a fixed report format, per-task model and effort rules, and a review cadence. Starting another project means copying it by hand. That copy carries over Linkeza's 11 areas whether the project needs them or not. It also carries the owner's personal setup (pt-BR, RTK, context-mode, CEO-only `AskUserQuestion`), which means nothing to anyone else. And it carries model names that go stale on the next release.

## Solution

A new plugin, `agent-operating-model`, with one skill, `setup-operating-model`. Run in any project, the skill:

1. **Reads the project** for concrete signals and sizes the model from them.
2. **Asks at most three questions,** one at a time, about what the repo cannot show.
3. **Proposes the whole model in one message:** roles, chain of command, the agent list with one line and the justifying signal each, and the files it will create or change.
4. **Writes after one "yes".** It never overwrites an existing file without showing a diff and getting a per-file OK.

It generates three artifacts:

| Artifact | Holds |
|---|---|
| `docs/OPERATING-MODEL.md` | The full protocol, in one place. |
| `.claude/agents/*.md` | Only the leads and specialists the project's signals justify. |
| A short "Operating model" section in `CLAUDE.md` | A pointer to the doc. It holds no rules, because copies drift (Linkeza review 2026-10-18, item 9). The section always goes in `CLAUDE.md`, the file the main session loads, even when `CLAUDE.md` only imports `AGENTS.md`. If `CLAUDE.md` is missing, the proposal lists it as a new file holding only this section. |

## User Stories

1. As a solo developer with a single-app repo, I want a model with no leads, just the main session and two to four specialists, so delegation doesn't add a relay layer that costs model round trips.
2. As the owner of a multi-app monorepo with infra and non-code work, I want leads per area, each justified by a path in my repo, so I can see why each area exists.
3. As an owner, I want to see the full proposal before anything is written, and to approve it once, so the skill never writes `.claude/` or `CLAUDE.md` without my consent.
4. As an owner re-running the skill on a project that already has agents, I want the delta (keep, adjust, new, unused) with diffs, so the rules my reviews produced survive.
5. As someone who isn't Pedro, I want the generated model to follow my own environment's language and tools, not RTK or pt-BR.
6. As a dispatcher (main session or lead), I want a per-task model and effort table in the protocol, and a safe default in each agent file, so a spawn that forgets the parameters doesn't silently inherit the session's model.

## Implementation Decisions

### Plugin shape

- `plugins/agent-operating-model/.claude-plugin/plugin.json` at `0.1.0`, with a matching `marketplace.json` entry. The description is identical in both. Everything lands in one change, as [CONVENTIONS](../CONVENTIONS.md#branching-and-pr-workflow) requires.
- `skills/setup-operating-model/SKILL.md` stays lean: the steps and the decision rules. Depth goes to skill-local `references/`, such as the sizing signals, the generic rule catalogue and the effort/model table. The generated files' skeletons go to `templates/` (`operating-model.md`, `lead.md`, `specialist.md`, `claude-md-section.md`).
- **Triggering.** The skill auto-triggers on a narrow description that matches explicit requests only. Examples: "set up an agent team / operating model for this project", "which agents does this project need", "create leads and specialists". It also stays invokable as `/agent-operating-model:setup-operating-model`, so no `disable-model-invocation`. The description excludes single-subagent requests ("create a code-reviewer subagent") and doc scaffolding ("init this project", which belongs to `project-initializer`).
- **Relationship to `project-initializer`.** This is a separate plugin with no dependency on it. The skill reads `AGENTS.md`, `CLAUDE.md`, `docs/PRD.md`, `docs/ROADMAP.md` and `docs/CONVENTIONS.md` when they exist, and works without them.

### Reading the project (sizing by signals)

Signals the skill reads, each recorded with the path it came from:

- **Apps, packages and stacks:** manifests (`package.json` workspaces, `pnpm-workspace.yaml`, `go.mod`, `pyproject.toml`, and the like) and top-level app directories.
- **Code volume:** a file and line count by area, done with a script that prints totals, not by reading files.
- **Existing docs:** PRD, ROADMAP, CONVENTIONS, ARCHITECTURE.
- **Delivery:** CI workflows, deploy and infra configuration.
- **Risk:** personal data, auth, payments, consent, legal text.
- **Non-code work:** marketing, legal, content and design folders.
- **Existing agent setup:** `.claude/agents/`, a current `OPERATING-MODEL.md`, `CLAUDE.md`.

The tier comes from the number of **justified areas**. Each of these counts as one area when the repo has a signal for it:

- each app or stack;
- infra and CI together;
- risk data (personal data, auth, payments);
- each non-code front (marketing, legal, content, design).

| Tier | Justified areas | Shape |
|---|---|---|
| Small | 1–2 | No leads. The main session dispatches two to four specialists directly. |
| Medium | 3–5 | One lead per area, each with its specialists. |
| Large | 6+ | Same shape as medium, with more areas (Linkeza has 11). |

Code volume only breaks ties at a tier boundary. These starting thresholds were decided 2026-10-26 (D15). They live in `references/` and are tuned against eval cases 1 and 2.

**Proposal format.** The proposal states the tier and its area count. Every area and every agent gets its own line, ending in `Signal: \`<path>\``, so evals can grade it with a regex.

**Questions to the owner.** After reading, the skill asks at most three questions, one per message, multiple choice, with the inferred answer first as the recommendation. It asks only what the repo cannot show, and **skips any question the request already answers**:

- Who the human owner is: one person or a team.
- Areas planned that have no code yet.
- What must never happen without the owner.

Every other open point goes into the proposal as an editable default, never as a fourth question. Examples are the worktree policy and the review frequency.

### Generic rules vs. the owner's personal setup

**Generic, part of the generated protocol.** Each rule is generalized from Linkeza's `docs/OPERATING-MODEL.md`; line numbers refer to that file as of 2026-10-26.

- **Chain of command:** owner → main session ("CEO") → leads → specialists → ad-hoc team members (:9-15). Small-tier projects drop the lead layer.
- **Questions flow up.** Subagents cannot ask the owner. They end their report with a questions block, and the main session asks the owner, then resumes the agent with `SendMessage`, passing the answers verbatim (:62-63). Before asking, the main session checks whether the docs already answer the question (:61).
- **Fixed report format** (:73-90):
  - Result line, done, evidence, files and commits, questions, risks and next steps.
  - Evidence, not assertions: anything not run is marked "not verified".
  - Short lists, not prose.
  - Headings are written in the project's language.
- **Dispatch defaults:**
  - Prefer resuming an agent with `SendMessage` over spawning a new one (:51).
  - A lead waits for every child it spawned before handing back (:52, review 2026-10-18 item 4). Linkeza phrases this as "children in the foreground". Spawns from an interactive session go to the background by default, and changing that takes a settings change, which is owner-only. So the generic rule is about waiting for children, not about a run mode.
- **Lead rotation:** a fresh lead at each plan stop point, or past a size or turn threshold measured without images (:53). The 5 MB / 150-turn values are Linkeza's measurements; the template marks them as defaults to tune.
- **Briefs** point at a rule or plan section by line range and never copy it, and they end with a pointer to the report format (:124-127).
- **Classifier denial:** the agent stops. It doesn't reword and retry, switch tools or hand the action to another agent. It returns the denial text, and the owner picks the fix (:92-100).
- **One writer at a time** in the main checkout (:181). Whether worktrees are also restricted to read-only work depends on the project's tooling; in Linkeza, agents' `git` calls inside worktrees were refused. The proposal sets this as an editable default ("worktrees for read-only work"), not as a question.
- **Owner-only actions** (:198-206): creating third-party accounts or domains, spending money, publishing or sending anything, pushing or merging the default branch, and changing `.claude/` configuration or permissions. The owner's answer to question 3 extends the list.
- **Read-only agents** (reviewers, auditors) set `disallowedTools: Edit, Write, NotebookEdit`.
- **Agent file skeleton:**
  - Lead: intro with a "Read first" list, Scope, Team, Skills and tools, Rules, Done means.
  - Specialist: intro, What you do, Skills and tools, Rules, Output.
- **Session hygiene** (:219-227, minus its Brain notes and PR runbook):
  - Before `/clear` or `/compact`, the main session writes a handoff file with the goal, state, decisions and next steps. If the `context-handoff` plugin is installed, it can do this; the rule doesn't depend on it.
  - Merged worktrees and branches are cleaned up.

**Left out; inherited from the environment instead.** The skill reads the project's and the user's `CLAUDE.md` and follows what is already there:

- **Language.** The owner's language sets the language of reports, questions and agent file names. A Portuguese project gets `lider-<area>.md` / `especialista-<tarefa>.md`; others get `lead-<area>.md` / `specialist-<task>.md`.
- **Shell and context tooling** (RTK, context-mode). These become a pointer to the rule that already exists, never a copy, and nothing at all when no such rule exists.
- **Owner-contact style.** `AskUserQuestion`-only contact, images in design questions, batched logins and "now/later" step lists are not built in.
- **Linkeza specifics.** Its area list, folder map, security posture, PR runbook, Brain notes and the dated temporary effort cap are not carried over.

### Model and effort

The live sub-agents page (2026-10-26) settles the mechanics:

- **Model order:** a per-invocation `model` parameter beats the agent file's `model`, which beats `CLAUDE_CODE_SUBAGENT_MODEL`. With none of them set, the agent inherits the main conversation's model.
- **Effort order:** a per-invocation `effort` parameter overrides the file's `effort` field and needs Claude Code ≥ 2.1.292. `CLAUDE_CODE_EFFORT_LEVEL` overrides both.

The decision is **the dispatcher chooses, with a floor in the file**:

- `OPERATING-MODEL.md` carries the per-task table, generalized from Linkeza (:41-50). Every spawn sets `model` explicitly, and sets `effort` explicitly where the CLI supports the parameter (≥ 2.1.292); otherwise the file's floor applies.
  - `low`: lookups and formatting.
  - `medium`: mechanical work and its review.
  - `high`: real logic, and review where personal data, money or a hard constraint is at stake.
  - `xhigh` / `max`: only with the main session's explicit OK.
  - `opus` for logic, design and every review; `sonnet` + `medium` for mechanical work; `haiku` + `low` only for a checkable lookup or for running a gate and summarizing it, never for logic, security, personal data, money, docs, reviews or leads.
- **Deliberate deviation from Linkeza.** Linkeza's agent files set no `model` or `effort` (:38). Here, every generated agent file sets a floor in its frontmatter (D16). If a spawn omits the parameters, the agent lands on a sane value instead of inheriting the session's model. The floor also covers CLIs older than 2.1.292; the owner's local CLI is 2.1.280. The floors by role:

  | Role | Floor |
  |---|---|
  | Lead | `opus` / `medium` |
  | Read-only reviewer or auditor | `opus` / `high` |
  | Logic or design specialist | `opus` / `medium` |
  | Mechanical specialist (docs, config, ports) | `sonnet` / `medium` |

  `haiku` is never a floor. It is used only when a spawn picks it explicitly.
- Models are named by **alias** (`opus`, `sonnet`, `haiku`), never by full ID, so the files don't go stale at each release. Per the docs, a family alias blocked by an org allowlist resolves to that family's newest permitted version.

### Review cadence

- **Per task, by risk.** A read-only reviewer per task where personal data, money, auth or a hard constraint is involved. Low-risk tracks get one reviewer per group of tasks. Wording-only findings are fixed without a new round (:166-167).
- **Periodic agent review, opt-in.** It produces `docs/agent-reviews/YYYY-MM-DD.md`, one item per problem. It runs only on the owner's yes, and fixes land item by item with approval (:231-239). Frequency comes from the repo's commit rhythm and defaults to weekly. It runs in a separate session, by the quality lead if the model has one, and otherwise by a read-only reviewer agent the main session spawns for it.

### Re-run (update mode)

When `.claude/agents/` or an `OPERATING-MODEL.md` already exists, the skill switches to update mode:

- It classifies each existing agent as keep, adjust, new or unused, and proposes only the delta.
- An existing file changes only through an approved diff.
- Nothing is deleted. An unused agent becomes a removal suggestion in the report, and the owner removes it.
- Agents not in the generated format are adopted: the skill never reformats them to the template. It can still propose a targeted diff for them, for example adding a missing `model`/`effort` floor.

## Testing Decisions

The gate is the same as for every plugin:

- `python3 scripts/check_compliance.py`: version and description sync, frontmatter and the `name`/`description` limits, dead links in `SKILL.md` files, reserved names.
- `claude plugin validate .` and `claude plugin validate ./plugins/agent-operating-model`.

CI (`.github/workflows/validate.yml`) runs exactly these, with no plugin-specific step.

### Behavior evals

There are six cases in `plugins/agent-operating-model/evals/<case>/`, run by hand. They are not a CI gate. One command runs the suite:

```
claude plugin eval ./plugins/agent-operating-model --trust-plugin --no-publish --scaffold \
  --allow-tools Write Edit "Bash(find *)" "Bash(wc *)" "Bash(git *)"
```

- **Tool grants.** Eval runs remove `Write`, `Edit` and `Bash` unless they are granted. Without the grants, cases 1, 2 and 4 would pass "nothing written" trivially, and case 3 could not write at all. Each case also lists `Skill`, `Read`, `Glob` and `Grep` in `allowed_tools`.
- **Case 3 runs separately.** It adds `--ablation with-without`, because a `history_file` case run against a path is single-arm by default.
- **Case files.** Cases 1–4 carry a `case.yaml` (`schema_version: "1.1"`, `name`, `context.scaffold_script`) beside `prompt.md`. Cases 5–6 are `prompt.md` only.
- **Fixtures.** Fixtures are in English. Every positive prompt already answers the skill's three owner questions, so a headless run reaches the proposal instead of stopping at the first question.
- **Graders.** `regex` (on `last_message` or `trace`), `tool_used` and `file_exists`; `llm` only for one short PASS/FAIL criterion ([PITFALLS](../PITFALLS.md), 2026-09-23). Every case sets `max_turns` with headroom ([MODEL-NOTES](../MODEL-NOTES.md#prompting-adjustments)).

| # | Case | Fixture | Graders |
|---|---|---|---|
| 1 | `small-repo-no-leads` | One app, no infra | `tool_used` Skill = `setup-operating-model`. `regex` `(?i)tier:\s*small`. `llm`: PASS if the proposal lists no lead and two to four specialists. `tool_used` Write and Edit `max: 0`. |
| 2 | `monorepo-proposes-leads` | Several apps, CI, infra, a `marketing/` folder | Skill fired. `regex` `(?i)tier:\s*(medium\|large)`. `regex` ``Signal: `[^`]+` `` (min 3). `tool_used` Write and Edit `max: 0`. |
| 3 | `approved-writes-files` | Case 2's fixture with no `CLAUDE.md`. A `history_file` recorded once from a case-2 run that ends with the proposal. `prompt.md` is the owner's "yes". | `file_exists` for `docs/OPERATING-MODEL.md`, `CLAUDE.md` and a `.claude/agents/*.md` glob. `regex` on `trace`: `model:\s*(opus\|sonnet)` and `effort:\s*(medium\|high)`. `regex` on `trace` for `claude-(opus\|sonnet\|haiku)-\d` with `max: 0`. |
| 4 | `rerun-preserves-existing` | An existing `.claude/agents/` (one file with a sentinel line) and an `OPERATING-MODEL.md` | `tool_used` Write and Edit with `input_match` on the existing paths, `max: 0`. `regex` `(?i)keep` and `(?i)unused` on the reply. |
| 5 | `negative-single-subagent` | none | "Create a code-reviewer subagent for this repo" does not fire the skill (`tool_used` Skill `max: 0`). |
| 6 | `negative-init-project` | none | "Init this project" does not fire the skill. |

**Before building case 3,** verify that a headless run granted `Write` can create files under `.claude/agents/`, which may be a protected path. If it can't, case 3 grades the `Write` calls' inputs in the `trace` instead of the files.

After case 3, run `claude plugin validate .claude/agents` once by hand inside a run kept with `--keep-temp`. The command accepts an agents directory from Claude Code 2.1.233. At build time, confirm exact grader keys, `file_exists` glob support and `case.yaml` fields against the live [plugin-evals](https://code.claude.com/docs/en/plugin-evals) page.

## Acceptance criteria (definition of done for the build)

1. `plugins/agent-operating-model/` exists with `plugin.json` at `0.1.0`. A `marketplace.json` entry has the same version and an identical description.
2. `skills/setup-operating-model/SKILL.md` exists, and `check_compliance.py` reports no failure and no size warning for it. Its depth lives in `references/` and `templates/`.
3. `python3 scripts/check_compliance.py` exits 0.
4. `claude plugin validate .` and `claude plugin validate ./plugins/agent-operating-model` both pass, with the output shown in the PR.
5. The six eval cases above exist and were run once, with the commands above. The PR shows WITH, W/OUT and Δ per case, including case 3 via `--ablation with-without`. A failing case is reported with its `evidence` field read, not hidden.
6. No personal or Linkeza-specific rule is in the skill. `grep -riE 'rtk|context-mode|linkeza|askuserquestion only' plugins/agent-operating-model/skills` returns nothing. The Portuguese file-name prefixes from D14 are expected and allowed.
7. `grep -rE 'claude-(opus|sonnet|haiku)-[0-9]' plugins/agent-operating-model/skills` returns nothing: models are named by alias everywhere, `references/` included.
8. The living docs are updated in the same PR:
   - `docs/FEATURES.md`: a new section; the counts become 12 plugins and 62 skills.
   - `docs/STACK.md`: the Versions paragraph.
   - `docs/ROADMAP.md`: a Phase 3 item.
   - `docs/CONVENTIONS.md` › Testing: this plugin's tool grants and its separate case-3 run.
   - `AGENTS.md`: the plugin count and the list of plugins with evals (line 19).
   - `docs/ARCHITECTURE.md`, `docs/SUMMARY.md` and `README.md`: the plugin count, wherever it is stated.
9. The work lands on branch `feat/agent-operating-model` as a draft PR. Commits follow Conventional Commits (`feat(agent-operating-model): …`), with no AI attribution in commits or the PR. This PRD flips to `status: implemented`.
10. The bundled `/code-review` ran on the diff before the PR left draft, and the PR body lists its findings and how each was handled ([MODEL-NOTES › Deliberate deviations](../MODEL-NOTES.md#deliberate-deviations)).

## Out of Scope

- Shipping agents inside the plugin itself. The plugin generates project-local `.claude/agents/`; it bundles none.
- Agent teams (the experimental multi-session feature). This plugin is about subagents.
- Hooks or settings that enforce the protocol, such as blocking a spawn without `model`. Changing `.claude/settings.json` is an owner-only action.
- Editing Linkeza. It is a read-only reference.
- A user-level preferences file in the style of `linear-flow`'s conventions file. The owner rejected it in favor of inheriting from existing `CLAUDE.md` files.

## Decisions

Made by the owner on 2026-10-26, one question at a time:

| # | Question | Decision |
|---|---|---|
| D1 | Where it lives | New plugin, not a third `project-initializer` skill |
| D2 | Writing | Propose first, write after one "yes"; existing files change only by approved diff |
| D3 | Artifacts | `OPERATING-MODEL.md` + `.claude/agents/*.md` + a pointer section in `CLAUDE.md` |
| D4 | Sizing | Tiers by repo signals; every area cites its signal |
| D5 | Owner questions | At most three, only on what the repo can't show |
| D6 | Personal rules | Left out; inherited from the existing `CLAUDE.md` files |
| D7 | Model/effort | Dispatcher chooses per task; a conservative floor in each agent file |
| D8 | Model naming | Aliases, not full IDs |
| D9 | Review cadence | Per task by risk, plus an opt-in periodic agent review |
| D10 | Re-run | Update mode: classify, diff, never delete |
| D11 | Triggering | Auto on a narrow description, plus the manual slash command |
| D12 | Names | Plugin `agent-operating-model`, skill `setup-operating-model` |
| D13 | Evals | The six cases above |
| D14 | Agent file names | In the project's language |
| D15 | Tier thresholds | By count of justified areas: 1–2 small, 3–5 medium, 6+ large |
| D16 | Floor values | Lead `opus`/`medium`, reviewer `opus`/`high`, logic specialist `opus`/`medium`, mechanical specialist `sonnet`/`medium`; never `haiku` |

## Further Notes

- The tier thresholds (D15) are starting values, tuned with evals 1 and 2. The lead-rotation numbers (5 MB / 150 turns) are Linkeza's measurements. Neither is a fact about every project.
- If a future Claude Code release adds a per-agent "require model on spawn" setting, D7's floor may become unnecessary. Re-check the sub-agents page before the next minor version.
