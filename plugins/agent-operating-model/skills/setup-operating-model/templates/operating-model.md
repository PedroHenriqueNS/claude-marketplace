<!--
Template for docs/OPERATING-MODEL.md. Fill every {{placeholder}}; delete these comments.
Write it in the owner's language (headings included). For a Small-tier project, remove
the Leads row, the Areas table's Lead column, the Lead rotation rule and lead-specific lines.
When headings are translated, update the in-file anchors (#report-format-…, #the-hand-back-script) and the
"§ <section>" names cited in the agent files, the practices files and the CLAUDE.md pointer
to match. Drop the docs/practices paragraph under Areas when no practices file was approved.
Values marked "default — tune" are starting values the owner adjusts. A section marked
"(optional)" stays only when the proposal's editable default turned it on; a line marked
"(option: <name>)" stays, without the mark, only when that option is on.
-->

# {{Project}} — Operating model

{{Project}} is built by an agent organization running in Claude Code for {{owner: one person | a team}}. This file is the protocol every agent follows. The main session, every lead and every specialist read it first.

## Chain of command

| Role | Who | Defined in | Talks to |
|---|---|---|---|
| **Owner** | {{owner}} | — | The main session |
| **Main session ("CEO")** | The main Claude Code session in this repo | `CLAUDE.md` + this file | The owner, the leads and the one-task executors it spawns |
| **Leads** | One per area | `.claude/agents/{{lead-prefix}}-*.md` | The main session (report) and their specialists |
| **Specialists** | Reusable experts per task type | `.claude/agents/{{specialist-prefix}}-*.md` | Whoever spawned them (report) |
| **Team members** | Ad-hoc implementers and reviewers spawned for one task | The spawn prompt | Whoever spawned them (report) |

### Areas

| Area | Lead | Specialists | Signal |
|---|---|---|---|
| {{area}} | `{{lead}}` | `{{specialist}}`, … | `{{path}}` |

How agents work on each kind of thing lives in `docs/practices/`: {{`ui.md` (screens), `backend.md` (APIs and data), … — one entry per practices file}}. The lead of an area reads its file first; a specialist reads the sections its brief names; reviewers judge by the whole file.

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
- **Before every spawn the main session answers two questions:** does the task need a coordinator (several agents or stop points) or one executor? Does it need new reasoning, or is it mechanical? The answers pick the row:

  | Task | Agent | `model` | `effort` |
  |---|---|---|---|
  | A record, doc edit or summary from facts the brief holds | one executor (`<Area> › Executor`) | `sonnet` | `medium` |
  | A lookup or a gate run whose answer a script checks | one executor | `haiku` | `low` |
  | A plan's stop point, area work with several agents | the area's lead | `opus` | `medium` |
  | New logic, money, auth, personal data, a hard constraint, design | the area's lead | `opus` | `high` |
  | A review | a reviewer | `opus` | the reviewed task's |
- Each agent file carries a floor (`model`/`effort` in its frontmatter) for spawns that omit the parameters. The floor is a safety net, not the choice.
- Prefer resuming a finished agent with `SendMessage` over spawning a new one for the same thread of work.
- The main session evaluates and delegates (`CLAUDE.md`): it does a piece of work itself only when delegating it would block it, or would spend many tokens for nothing; research, extraction, measurement and analysis go to agents from the first step. It briefs, decides and checks. Its effort is never lowered to save tokens.
- **Titles.** The Agent tool's `description` is the title the owner sees in the agent list. It starts with who the agent is, a pipe, then the task: `<Role> | <task>` (an ad-hoc member: `<Area> › <role> | <task>`). A title can't change later and a resumed agent keeps it, so a lead is named for its role, not its first task. Leads title their own spawns the same way.
- **Waiting for children.** A lead waits for every child it spawned to return, and hands back with their work committed. A child resumed with `SendMessage` runs in the background, even when its first run was in the foreground: a lead that resumes a child and needs its result does not end its turn, and waits with one blocking command of at most 4 minutes 30 seconds (a shell until-loop capped at 270 s that ends on the child's commit or report, then the next such call, until the child ends; never `Monitor`, which returns at once and ends a subagent's turn). A subagent's prompt cache lasts about 5 minutes, so the turn after a longer wait writes its whole context into the cache again. A capped wait repeated is not polling; the main session is not held to the cap. If the lead is told to hand back while a child still runs, its report's status line is `BLOCKED: waiting for <child id>`, and the main session resumes the lead only after that child's notification.
- At each lead hand-back the main session runs [the hand-back script](#the-hand-back-script): a child of the lead that wrote to its transcript in the last 2 minutes still runs, and the report counts as `BLOCKED: waiting for <child id>`.
- Before integrating a lead's work into a shared checkout, the main session runs `git status`; uncommitted work there means it resumes the lead to finish it.
- **Lead rotation:** a lead is replaced by a fresh one at each plan stop point, or when its transcript passes about {{5 MB}} of conversation (its `user` and `assistant` records, image data stripped) or {{150}} model turns, whichever comes first. It is measured by [the hand-back script](#the-hand-back-script) at each hand-back and before each `SendMessage` resume. (default — tune)

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
**Skills invoked:** <list; a named skill skipped, and why>
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
- An option's label is the owner's choice; its description is the main session's text. A decision records the label picked; any wording inside the description stays (proposed) until the owner sees it in place.
- A rule that limits the customer states its consequence for the customer and its provenance. A permanence word about the customer's data, names or money ("never", "forever", "irreversible") names the owner's words and date, or a reviewer fails it.
- A business or product plan is a hypothesis, not an implementation plan: a line of it enters a spec only with its consequence stated and the owner's yes; until then it is (proposed).
- Rejected options and the owner's accepted exceptions to a rule or standard are kept in one list per scope. No agent or reviewer "fixes" or reopens one without asking.
- An external fact (a price, a law, an API, a competitor's claim) carries its source and the date it was read, or "not verified". No done criterion rests on a fact from memory.

### The decision register (optional)

`docs/decisions/INDEX.md` (loaded every session, no decisions in it) points at one file per area and at `resources.md` (one row per domain, host, account, mailbox and key name: its role and what it must never be used for). Each entry: the decision, why, the owner's words with the date, and "irreversible after production" where it applies; a rule already in a conventions file is linked, not copied. A decision that replaces another moves the old entry to `history.md`.

- The main session writes a new decision into its area file before the next step.
- A task reads its area's file first; a resource is used only after its row is read, and with no row the owner is asked.
- A spec, plan or runbook that contradicts the register, or uses a resource with no row, fails review.

### Non-code work and milestones

- Non-code work (copy, legal, research, design) runs as: brief → specialists draft → lead reviews → owner approves → saved in the repo. A draft holds nothing until approved.
- One milestone at a time, unless the owner asks otherwise. At its close, the roadmap and features docs are updated and the next step is reported as options.

### Execution pace

- **Fewer turns.** Every model call starts from a fixed base (the imported docs, tools and skills), so the number of turns is the cost. Batch independent tool calls in one message. Resume a finished agent on the same thread instead of spawning anew, until rotation calls for a fresh one. An agent reports once, at the end of its task. No polling by repeated calls: wait with one command that ends on the condition (a subagent's wait for a child is capped, as § Waiting for children says).
- **Dispatch only what the task needs.** One task of one kind of work goes to one specialist. Splitting agents by area and kind of work does not mean more spawns: never spawn every specialist of an area "for coverage".
- **Stop rule.** After two rounds in which the measured number does not move toward the goal, the agent stops and reports options; no third round without the main session's OK.

### Briefs

- A brief points at a rule or a plan section by its line range; it never copies it. Copies drift. A brief to a specialist names the sections of the practices files it needs the same way.
- A brief names the one or two skills the task requires, from the agent file's list.
- A brief never tells an agent to get around a tool's protection.
- A brief states the goal and what is ruled out, not a hypothesis: a brief that carries a hypothesis tends to come back confirmed.
- A brief passes an owner's choice with its intent and says what not to take literally. A question about a tone or a feeling names the effect in plain words, never a metaphor an agent could build literally.
- A brief gives a reviewer the owner's decisions as context, never as a list of what it must not look at.
- A brief ends with one line pointing at [Report format](#report-format-every-agent); that format replaces the report template of any other skill the agent runs.
{{- If CLAUDE.md has shell or file-reading rules: "A brief points at <that rule> and does not restate it."}}

### Review cadence

- **One owner each:** a lead owns exactly one area and a specialist does one kind of work. New work outside every agent's scope gets a new agent, not a wider one.
- **Adversarial review of domain work** runs in the area that owns it: a fresh instance of that area's lead, plus specialists who did not write the work. It never goes to the quality lead or reviewer.
- **Per task, by risk:** a read-only reviewer per task where production personal data, money, auth or a hard constraint is involved (test data in local or staging does not count). Low-risk tracks get one reviewer per group of tasks.
- A finding that is only wording is fixed directly, without a new review round.
- **Review only what needs it.** A re-review after fixes reads only the fixes and the tests that prove them. Work that passed its own reviewer is not reviewed again. A milestone review reads the diff once; a second covers only what changed since. Near a milestone's close the scope is frozen: a new finding enters only if it breaks a hard constraint, touches money or leaks personal data; the rest goes to an after-merge list.
- A plan task that creates a file names its folder by the layout rule of the scope's conventions, and the task's reviewer checks the path against that rule.
- A line of a scope's conventions that departs from the plugin or skill the scope follows says so, with the owner's words and date ("diverges from `<plugin>`: …").
- The owner's personal data (e-mail, phone, address, documents) is never in a tracked file: code, docs, runbooks, fixtures or commit messages. A runbook says "your personal account"; the main session names the account in its message. Every reviewer checks the diff for it.
- Reviewers and auditors are read-only agents (`disallowedTools: Edit, Write, NotebookEdit`).
- A verdict is given per requirement (met / not met / not verified), blocking gaps first with file, line and evidence, style marked optional. The reviewer reads a rule's whole file before judging by it, runs the gates itself, and checks by mutating the code that each rule is held by a test.
- A milestone review also reads across its tasks, for code that grew over several diffs. It lists every customer-limiting rule with no owner provenance, as a question for the main session, not a finding against the code; and every conventions line marked as a divergence, and every pattern the conventions name as the model, checked against that plugin or skill (an unmarked departure is a finding). Reviewers only flag written rules, so a principle they must enforce is written once in the conventions or a practices file.

### Parallel work

- Agents run in parallel only when their scopes don't overlap.
- The main checkout stays on the default branch, for the owner to read. Each task branch lives in its own worktree: whoever dispatches committing work first creates it (`git worktree add <path> -b <type>/<slug> <base>`) and names its path in the brief; one writer per worktree. Dispatch isolation modes whose `git` the environment refuses are for read-only work.
- A feature's areas whose plans touch different files run in parallel, each in its own worktree and branch cut from the feature branch; at each area's stop point the main session merges that branch into the feature branch locally and runs the stop point's proof there. It never touches the default branch or the remote; the feature keeps one pull request.
- An agent never deletes a file or folder it did not create in its task, git-ignored or untracked included; cleanup of shared state goes to its lead.
- An agent stops only the processes it started, by PID, never by name. Parallel checkouts get their own container, project and port names; nobody tears down a volume another checkout uses.
- A worktree is removed only when it has no uncommitted change and its commits are on the default branch; otherwise the main session decides.
- Claude Code runs at most {{20}} subagents at once and lets them nest {{three}} layers below the main session (its defaults; use the values the environment sets). Under a lead, a specialist is the second layer, so the helpers it spawns cannot spawn any.
- Worktrees: {{one per task branch, created by the dispatcher}}. (default — tune)

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
- When a pull request that changes this file, a conventions file{{ or the decision register}} merges, the main session merges the default branch into every open feature branch that day, before the next dispatch there.
- **Main-session rotation:** size is the transcript's conversation only (its `user` and `assistant` records, image data stripped; the host app's own records left out). The main session measures itself at every hand-back (a lead's, or with no leads a specialist's), in [the hand-back script](#the-hand-back-script), and once past about {{5 MB}} rotates at the next clean point (no child running, no uncommitted tracked change, handoff written), not at the next stop point. It hands over to a **new top-level session**, never one nested under itself; the new session starts by reading the handoff and § Talking to the owner. A live owner session (the owner at a screen) is not a clean point unless the transcript is far past the threshold; then the handoff names the lead to spawn for it (type, model, effort, the runbook step), and the new session's first act is that spawn, never an answer about the screen itself. Earlier main sessions are closed or archived.
- (option: usage-pause) The main session reads the plan's usage at every hand-back and before every dispatch. Above {{97}}% no agent gets a new task; at {{99}}% nothing runs, running agents stop at a clean point, and the owner is told where each piece stopped and when the limit resets.
- Before stopping a lead, or a process its children use (a container runtime, a dev server), the main session lists the lead's running children and stops them or waits for them. A stopped lead's queued messages still resume it.
- Merged worktrees and branches are cleaned up.

### The hand-back script

{{The hand-back script from the setup skill's practice notes, with this project's transcript folder filled in. It prints one line per child of the lead and the main session's conversation size.}}

## Periodic agent review

{{off | on, weekly}} (default: off until the owner says yes; weekly when on — tune to the repo's commit rhythm)

- It runs only on the owner's yes, in a separate session, conducted by {{the quality lead | a read-only reviewer the main session spawns for it}}.
- It covers the period's agent transcripts (summarized by a script, not read whole), commits, reports and denials.
- It delivers `docs/agent-reviews/YYYY-MM-DD.md` with fixed parts: the status of the previous review's items and of open incidents (held / partly / not held, with evidence); problems, highest impact first (agent, problem, evidence, proposed fix); cost by agent (runs, turns, tokens, active hours, from the transcripts by a script); what worked; not covered. Unused agent files are listed as removal candidates. After a change to the organization (agents split, merged or added), it compares cost per task (tokens, turns) before and after, and proposes a rollback when cost rose with no gain.
- **Incident records**, whether the review is on or off: a failure the owner calls serious gets a record in `docs/agent-reviews/incidents/YYYY-MM-DD-<slug>.md` the same day (timeline, causes, what changed, proposals). The next review dissects it first, with its measured cost.
- **A proposal closes only in a tracked file.** Each proposal of a review or an incident record is either applied in the docs or the agent files, with the owner's yes, or listed as declined. A note in a session's memory does not close it.
- Fixes land item by item, only with the owner's approval.
