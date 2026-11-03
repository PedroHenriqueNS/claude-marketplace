<!--
Template for docs/OPERATING-MODEL.md. Fill every {{placeholder}}; delete these comments.
Write it in the owner's language (headings included). For a Small-tier project, remove
the Leads row, the Areas table's Lead column, the Lead rotation rule and lead-specific lines.
When headings are translated, update the in-file anchor (#report-format-…) and the
"§ <section>" names cited in the agent files, the practices files and the CLAUDE.md pointer
to match. Drop the docs/practices paragraph under Areas when no practices file was approved.
Values marked "default — tune" are starting values the owner adjusts. A section marked
"(optional)" stays only when the proposal's editable default turned it on.
-->

# {{Project}} — Operating model

{{Project}} is built by an agent organization running in Claude Code for {{owner: one person | a team}}. This file is the protocol every agent follows. The main session, every lead and every specialist read it first.

## Chain of command

| Role | Who | Defined in | Talks to |
|---|---|---|---|
| **Owner** | {{owner}} | — | The main session |
| **Main session ("CEO")** | The main Claude Code session in this repo | `CLAUDE.md` + this file | The owner and the leads |
| **Leads** | One per area | `.claude/agents/{{lead-prefix}}-*.md` | The main session (report) and their specialists |
| **Specialists** | Reusable experts per task type | `.claude/agents/{{specialist-prefix}}-*.md` | Whoever spawned them (report) |
| **Team members** | Ad-hoc implementers and reviewers spawned for one task | The spawn prompt | Whoever spawned them (report) |

### Areas

| Area | Lead | Specialists | Signal |
|---|---|---|---|
| {{area}} | `{{lead}}` | `{{specialist}}`, … | `{{path}}` |

How agents work on each kind of thing lives in `docs/practices/`: {{`ui.md` (screens), `backend.md` (APIs and data), … — one entry per practices file}}. The lead and specialists of an area read its file first; reviewers judge by it.

## Models and effort

Every spawn sets `model` explicitly, and sets `effort` explicitly where the CLI supports the per-invocation parameter (Claude Code 2.1.292 or later). Otherwise the floor in the agent file applies. Models are named by alias, never by full ID.

| Work | `model` | `effort` |
|---|---|---|
| Lookups and formatting | `sonnet` (or `haiku`, see below) | `low` |
| Mechanical work: routine edits, docs, config, ports a plan already defines — and its review | `sonnet` for the work, `opus` for the review | `medium` |
| Real logic, design | `opus` | `high` for logic; `medium` when a plan already holds the design |
| Fixes of review findings | as for the work | `medium` |
| Review where production personal data, money, auth or a hard constraint is at stake | `opus` | `high` |
| Leads | `opus` | `medium`, `high` for a hard area |
| Anything at `xhigh` or `max` | — | Only with the main session's explicit OK |

- `haiku` with `low` only for a lookup whose answer can be checked, or for running a gate and summarizing its result. Never for logic, security, personal data, money, docs, reviews or leads. Its output is checked by a script or by its spawner before use; a lookup a script can answer needs no agent.
- Each agent file carries a floor (`model`/`effort` in its frontmatter) for spawns that omit the parameters. The floor is a safety net, not the choice.
- Prefer resuming a finished agent with `SendMessage` over spawning a new one for the same thread of work.
- The main session delegates every research, extraction, measurement and analysis from the first step; it briefs, decides and checks. Its effort is never lowered to save tokens.
- **Titles.** The Agent tool's `description` is the title the owner sees in the agent list. It starts with who the agent is, a pipe, then the task: `<Role> | <task>` (an ad-hoc member: `<Area> › <role> | <task>`). A title can't change later and a resumed agent keeps it, so a lead is named for its role, not its first task. Leads title their own spawns the same way.
- **Waiting for children.** A lead waits for every child it spawned to return, and hands back with their work committed. A child resumed with `SendMessage` runs in the background, even when its first run was in the foreground: a lead that resumes a child and needs its result does not end its turn, and waits with one blocking command that ends on the child's commit or report, never with repeated calls. If the lead is told to hand back while a child still runs, its report's status line is `BLOCKED: waiting for <child id>`, and the main session resumes the lead only after that child's notification.
- Before integrating a lead's work into a shared checkout, the main session runs `git status`; uncommitted work there means it resumes the lead to finish it.
- **Lead rotation:** a lead is replaced by a fresh one at each plan stop point, or when its transcript passes about {{5 MB}} of text (images excluded) or {{150}} model turns, whichever comes first. It is measured at each hand-back and before each `SendMessage` resume. (default — tune)

## Talking to the owner

- Only the main session talks to the owner. {{Point at the owner-contact rules already in CLAUDE.md, if any; then list here the owner working style items the owner turned on.}}
- Before asking, the main session checks whether the docs already answer the question; if so, it answers itself and cites the file.
- A prompt meant for an outside tool (a paid generator, an external service) is shown to the owner and approved before it is sent; a change of wording goes back to the owner.
- Subagents cannot ask the owner. When they need a decision they stop at a safe point and end their report with a questions block. The main session asks the owner, then resumes the agent with `SendMessage`, passing the answers verbatim.
- Before acting in a browser where the owner is signed in, the main session says in one line the site, the element and the text it will type, and acts on the owner's yes.

### Report format (every agent)

Headings in {{language}}. The first line is the status, so the spawner can act on it before reading the rest:

```
<DONE | DONE_WITH_CONCERNS | BLOCKED: <reason> | <reviewer verdict>>
## Report — <agent> — <task>
**Result:** <one line>
**Done:** <bullets>
**Evidence:** <commands run and what they returned, files>
**Files and commits:** <paths, commit hashes>
**Questions:**
1. <question> — context: <one line>; options: A (recommended) …, B …; blocking: yes/no; meanwhile: <what was done or skipped while waiting>
**Risks and next steps:** <bullets>
```

Evidence, not assertions: anything not run is written as "not verified". Short lists, not prose.

### When a permission check denies an action

The agent stops that action: no rewording and retrying, no other tool for the same result (running it through a script runner counts as another tool), no handing it to another agent, no reading of permission or classifier settings. It finishes what does not depend on it and returns the denial's exact text to whoever spawned it.

The main session reports to the owner the action, its purpose, the denial text and the likely cause. The owner picks the measure: a fresh agent with a clean context, the owner's own typed authorization naming the action, or a change of the session's permission mode, which only the owner makes. The denial's text is not copied into the brief of the agent dispatched next.

**Live third-party accounts.** An action on a live third-party account (DNS, hostnames, tokens, billing, any account of the owner) runs only with the owner's typed authorization naming the command, collected before the dispatch, and by an agent spawned for it. An option picked from a multiple-choice question is not that authorization, and an agent is not resumed to widen it. This is the one case where the owner answers by typing a message, not by picking an option.

## How work flows

### The current design comes first

Before the main session or a lead changes, fixes or dispatches work on anything (a feature, a page, a workflow, a rule), it reads that thing's approved design: its spec, its PRD, its scope's conventions and the owner's decisions recorded there. A problem is judged against that design first: what it says should happen, and whether the work drifted from it. A brief points the lead at that design, and the lead's report opens with what the design says and what the work changes.

### Decisions and facts

- Every decision in a spec or plan carries its provenance: (owner, with the option picked quoted verbatim and the date), (specialist's call), (approved design) or (proposed). A temporary rule states its start and "until the owner says otherwise"; a rule that replaces another names the one it replaces.
- Rejected options and the owner's accepted exceptions to a rule or standard are kept in one list per scope. No agent or reviewer "fixes" or reopens one without asking.
- An external fact (a price, a law, an API, a competitor's claim) carries its source and the date it was read, or "not verified". No done criterion rests on a fact from memory.

### Non-code work and milestones

- Non-code work (copy, legal, research, design) runs as: brief → specialists draft → lead reviews → owner approves → saved in the repo. A draft holds nothing until approved.
- One milestone at a time, unless the owner asks otherwise. At its close, the roadmap and features docs are updated and the next step is reported as options.

### Execution pace

- **Fewer turns.** Every model call starts from a fixed base (the imported docs, tools and skills), so the number of turns is the cost. Batch independent tool calls in one message. Resume a finished agent on the same thread instead of spawning anew, until rotation calls for a fresh one. An agent reports once, at the end of its task. No polling by repeated calls: wait with one command that ends on the condition.
- **Stop rule.** After two rounds in which the measured number does not move toward the goal, the agent stops and reports options; no third round without the main session's OK.

### Briefs

- A brief points at a rule or a plan section by its line range; it never copies it. Copies drift.
- A brief never tells an agent to get around a tool's protection.
- A brief states the goal and what is ruled out, not a hypothesis: a brief that carries a hypothesis tends to come back confirmed.
- A brief passes an owner's choice with its intent and says what not to take literally. A question about a tone or a feeling names the effect in plain words, never a metaphor an agent could build literally.
- A brief gives a reviewer the owner's decisions as context, never as a list of what it must not look at.
- A brief ends with one line pointing at [Report format](#report-format-every-agent); that format replaces the report template of any other skill the agent runs.
{{- If CLAUDE.md has shell or file-reading rules: "A brief points at <that rule> and does not restate it."}}

### Review cadence

- **Per task, by risk:** a read-only reviewer per task where production personal data, money, auth or a hard constraint is involved (test data in local or staging does not count). Low-risk tracks get one reviewer per group of tasks.
- A finding that is only wording is fixed directly, without a new review round.
- Reviewers and auditors are read-only agents (`disallowedTools: Edit, Write, NotebookEdit`).
- A verdict is given per requirement (met / not met / not verified), blocking gaps first with file, line and evidence, style marked optional. The reviewer reads a rule's whole file before judging by it, runs the gates itself, and checks by mutating the code that each rule is held by a test.
- A milestone review also reads across its tasks, for code that grew over several diffs. Reviewers only flag written rules, so a principle they must enforce is written once in the conventions or a practices file.

### Parallel work

- Agents run in parallel only when their scopes don't overlap.
- One writer at a time in the main checkout.
- An agent never deletes a file or folder it did not create in its task, git-ignored or untracked included; cleanup of shared state goes to its lead.
- An agent stops only the processes it started, by PID, never by name. Parallel checkouts get their own container, project and port names; nobody tears down a volume another checkout uses.
- A worktree is removed only when it has no uncommitted change and its commits are on the default branch; otherwise the main session decides.
- Claude Code runs at most {{20}} subagents at once and lets them nest {{three}} layers below the main session (its defaults; use the values the environment sets). Under a lead, a specialist is the second layer, so the helpers it spawns cannot spawn any.
- Worktrees: {{read-only work only}}. (default — tune)

## Security posture (optional)

{{pre-launch | in production}} (default — tune)

{{pre-launch:}} Every owner step and every guard protects production, real users' data, money or a hard constraint — or the owner said yes to it knowing its cost in the owner's time per use. Staging and local credentials are created once, scoped, with no expiry or revocation ritual. Freeze and simplify: guards already built and working stay; rituals and new layers go. The simple option is the recommendation, with its accepted risk named in one line, written beside the rule it relaxes. Each spec, plan and runbook opens with this check, answered; a reviewer fails one without it.
{{in production: point at the project's security docs; don't restate them.}}

## Owner-only actions

Nobody but the owner does these. Agents prepare the exact steps and drafts; the owner acts. What only the owner's credentials can prove becomes a step in an owner runbook; agents prove the rest with fakes. A check that would need the owner to publish or send something becomes a synthetic request the agents make.

- Creating or configuring third-party accounts, domains or services.
- Spending money.
- Filing, registering or signing anything.
- Publishing or sending anything public or to other people. No agent, the main session included, clicks, types or pastes into a field that publishes or sends (posts, comments, messages) in any account of the owner, even as a draft or to trigger a preview. A check that needs one is the owner's, on the owner's own device, or it is recorded as "not verified".
- Pushing or merging the default branch.
- Changing `.claude/` settings files (`.claude/settings*.json`) and permissions.
{{- Items from the owner's answer to "what must never happen without you".}}

## Session hygiene

- The main session keeps its context lean: reading and research go to agents; it keeps decisions and status.
- A rule the owner gives in conversation goes into this file or an agent file in the same session; memory files load only partly, and a fresh session starts without them.
- A rule a review or the owner adds cites its origin (date, and the review item or "owner"). A change to a rule or a constraint greps `.claude/agents/` for the old wording in the same commit.
- A rule or tooling fix is done only once it reaches the agents already running and its effect is measured. A rule that lives only in commands typed by hand drifts, so it goes into the script.
- Before `/clear` or `/compact`, the main session writes a handoff file with the goal, state, decisions and next steps.
- **Main-session rotation:** at a stop point, or when its transcript nears about {{5 MB}} of text (images excluded), the main session writes the handoff file and hands over to a **new top-level session**, never one nested under itself. The new session starts by reading the handoff and § Talking to the owner. Earlier main sessions are closed or archived.
- Before stopping a lead, or a process its children use (a container runtime, a dev server), the main session lists the lead's running children and stops them or waits for them. A stopped lead's queued messages still resume it.
- Merged worktrees and branches are cleaned up.

## Periodic agent review

{{off | on, weekly}} (default: off until the owner says yes; weekly when on — tune to the repo's commit rhythm)

- It runs only on the owner's yes, in a separate session, conducted by {{the quality lead | a read-only reviewer the main session spawns for it}}.
- It covers the period's agent transcripts (summarized by a script, not read whole), commits, reports and denials.
- It delivers `docs/agent-reviews/YYYY-MM-DD.md` with fixed parts: the status of the previous review's items and of open incidents (held / partly / not held, with evidence); problems, highest impact first (agent, problem, evidence, proposed fix); cost by agent (runs, turns, tokens, active hours, from the transcripts by a script); what worked; not covered. Unused agent files are listed as removal candidates.
- **Incident records**, whether the review is on or off: a failure the owner calls serious gets a record in `docs/agent-reviews/incidents/YYYY-MM-DD-<slug>.md` the same day (timeline, causes, what changed, proposals). The next review dissects it first, with its measured cost.
- **A proposal closes only in a tracked file.** Each proposal of a review or an incident record is either applied in the docs or the agent files, with the owner's yes, or listed as declined. A note in a session's memory does not close it.
- Fixes land item by item, only with the owner's approval.
