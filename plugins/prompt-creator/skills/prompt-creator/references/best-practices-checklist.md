# Claude Code prompt-writing checklist (offline fallback)

> Distilled from <https://code.claude.com/docs/en/best-practices> on 2026-09-04. This file is the **fallback only** — when the live fetch works, the live page wins. If you are reading this because the fetch failed, tell the user the guidance may be stale.

The doc's core constraint: Claude's context window fills fast and performance degrades as it fills. A good prompt spends that budget well — it aims Claude precisely so the session doesn't burn context wandering or being corrected.

The sections below mirror the live page's ten body sections, in its order, so a rewrite can be checked against it section by section. Not every section applies to every prompt; the request's shape decides which bear hardest.

## 1. Give Claude a way to verify its work

Claude stops when the work *looks* done. Without a check it can run, "looks done" is the only signal, and the user becomes the verification loop. A check is anything returning a pass/fail Claude can read: a test suite, a build exit code, a linter, a script diffing output against a fixture, a browser screenshot compared to a design.

Once the check exists, the prompt decides how hard it gates the stop. Four tiers, increasing setup for decreasing attention:

1. **In one prompt** — ask Claude to run the check and iterate in the same message. Works on any task today; this is the tier most rewrites need.
2. **Across a session** — set the check as a `/goal` condition. A separate evaluator re-checks it after every turn and Claude keeps working until it resolves. If Claude stalls, the run eventually stops with the goal still set.
3. **As a deterministic gate** — a `Stop` hook runs the check as a script and blocks the turn from ending until it passes. Claude Code overrides the hook after 8 consecutive blocks.
4. **By a second opinion** — a verification subagent or a dynamic workflow, so the agent doing the work isn't the one grading it.

Tiers 2 and 3 are what let an **unattended** run finish correctly without the user. If the rewrite is for a session the user will walk away from, a bare in-prompt check is not enough — say so, and say that neither tier is an absolute gate: both release on the caveats above.

Always ask for **evidence, not assertions**: the test output, the command run and what it returned, a screenshot. Reviewing evidence is faster than re-running the verification. Separately, `/verify` is the *user's* own follow-up — they run it after Claude's check passes, to confirm the change against the running app. Don't write it into the prompt as Claude's step.

Related: address root causes, not symptoms — telling Claude to fix the build, verify it succeeds, and address the root cause rather than suppress the error beats "the build is failing".

## 2. Explore first, then plan, then code

Separate research from implementation so Claude doesn't solve the wrong problem. Plan mode (`Shift+Tab`, or `claude --permission-mode plan`) is the mechanism. Four phases: **explore** (read and answer, no changes) → **plan** (a detailed implementation plan; `Ctrl+G` opens it in an editor) → **implement** (verifying against the plan) → **commit**.

Plan mode adds overhead, so it earns its place. Planning is most useful when the approach is uncertain, the change spans multiple files, or the code is unfamiliar. **If you could describe the diff in one sentence, skip the plan.** Don't instruct plan-first on a typo, a log line, or a rename.

## 3. Provide specific context in your prompts

Claude can infer intent but can't read minds. Four strategies, each a before/after on the live page:

- **Scope the task.** Name the file, the scenario, and testing preferences. Not "add tests for foo.py" but "write a test for foo.py covering the edge case where the user is logged out. avoid mocks."
- **Point to sources.** Send Claude to whatever can actually answer the question — git history, a spec, a doc page — instead of letting it speculate.
- **Reference existing patterns.** Name a file that already does it right, say "follow this pattern", and state whether new libraries are allowed.
- **Describe the symptom.** For bugs: what users observe, the likely location, and what "fixed" looks like. Ask for a failing test that reproduces the issue before the fix.
- **State non-goals.** What must not change, what is out of scope. The page names over-engineering — extra abstraction, defensive code, tests for cases that can't happen — as the cost of leaving them unstated.

**Provide rich content** rather than describing it: reference files with `@`, paste images and exact error text, give URLs for docs (and allowlist frequently-used domains with `/permissions`), pipe data in (`cat error.log | claude`), or tell Claude to pull the context itself.

Vague is legitimate when exploring. "What would you improve in this file?" surfaces things the user wouldn't think to ask.

## 4. Configure your environment

Not prompt text, but the reason a prompt can stay short. When a rewrite keeps re-stating the same instruction, the instruction belongs somewhere durable instead:

- **CLAUDE.md** — loaded every session. Bash commands Claude can't guess, style rules that differ from defaults, test runner, repo etiquette, architecture decisions, env quirks, gotchas. Not: anything inferable from the code, standard conventions, API docs (link them), or anything that changes often. Keep it short — a bloated CLAUDE.md gets ignored. `IMPORTANT` on one line stands out; on many lines, none does.
- **Skills** (`SKILL.md` in `.claude/skills/`) — domain knowledge and workflows needed only *sometimes*, loaded on demand instead of bloating every conversation. `disable-model-invocation: true` for side-effecting workflows the user wants to trigger by hand.
- **Hooks** — for what must happen every time with zero exceptions. Deterministic, where a CLAUDE.md line is only advisory.
- **Permissions and sandboxing** — pre-approve trusted tools rather than writing "you may run npm test" into every prompt. Which advice applies depends on the starting mode: auto mode (Pro/Max/Team) already has a classifier reviewing most actions, while Manual mode asks before every write, Bash call, and MCP tool — there, allowlists and OS-level sandboxing are the two ways to cut the interruptions.
- **CLI tools** — the most context-efficient way to reach external services. Prefer `gh`, `aws`, `gcloud` over raw API calls; Claude can learn an unknown one from `--help`.
- **MCP servers** — issue trackers, databases, monitoring, designs.
- **Subagents** (`.claude/agents/`) — their own context and tool set, for work that reads many files.
- **Plugins** — bundles of the above, installed with `/plugin`.

If a prompt is long because it re-explains the project every time, that is the finding: move it, don't rewrite it.

## 5. Communicate effectively

Ask Claude the questions you'd ask a senior engineer — how logging works, what edge cases a class handles, why line 333 calls `foo()` instead of `bar()`. No special prompting required.

**For a feature too large for one prompt, the answer is still a prompt** — the interview kickoff. Adapt this shape to the user's feature:

```text
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious
questions, dig into the hard parts I might not have considered.

Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```

Then start a **fresh session** to execute the spec — clean context, focused entirely on implementation. On what makes a spec worth executing, the page is worth quoting directly: *"The most useful specs are self-contained: they name the files and interfaces involved, state what is out of scope, and end with an end-to-end verification step that proves the feature works. Time spent making the spec precise pays off more than time spent watching the implementation."*

## 6. Manage your session

Conversations are persistent and reversible.

- **Course-correct early.** `Esc` stops Claude mid-action with context preserved; `Esc Esc` or `/rewind` restores earlier conversation or code state; "undo that" reverts changes.
- **More than two corrections on the same issue is the signal.** The context is now polluted with failed approaches. `/clear` and start fresh with a better prompt incorporating what was learned — which is exactly the prompt this skill produces.
- **Manage context aggressively.** `/clear` between unrelated tasks. `/compact <instructions>` when you want control over what survives. `Esc Esc` → *Summarize from here* / *up to here* to compact only part of a conversation. `/btw` for a side question whose answer never enters history.
- **Use subagents for investigation** — they explore in a separate context and report back a summary, keeping the main conversation clean.
- **Checkpoints.** Every prompt creates one, so a risky attempt is cheap: try it, rewind if it fails. Caveat: checkpoints only track Claude's file-editing tools, not changes made through Bash or external processes.
- **Resume.** `claude --continue` / `claude --resume`; name sessions with `/rename` and treat them like branches.

## 7. Automate and scale

- **Non-interactive mode.** `claude -p "prompt"` for CI, pre-commit hooks, and scripts. `--output-format json` returns one object with a `result` field; `--output-format stream-json --verbose` prints one object per line for streaming.
- **Parallel sessions.** Worktrees for isolated checkouts; cross-session messaging to pass findings between them; the desktop app to manage several local sessions visually, each in its own worktree; Claude Code on the web to run them in the cloud; `claude agents` (Agent view, research preview) for background sessions watched from one screen; Agent teams (experimental, off by default) for automated coordination. A fresh context improves review, since Claude isn't biased toward code it just wrote — hence the Writer/Reviewer split across two sessions.
- **Fan out across files.** In a git repo, `/batch <instruction>` splits a change across 5–30 subagents, each in its own worktree opening a PR. To drive it yourself, generate a file list, then loop `claude -p` over it with `--allowedTools` scoping what each invocation may do — which matters when it runs unattended. Test on 2–3 files before the full set.
- **Auto mode.** `claude --permission-mode auto -p "..."` for uninterrupted execution with a classifier reviewing commands before they run.
- **Add an adversarial review step.** Before treating a task as done, have a subagent review the diff in a fresh context and report gaps. It sees only the diff and the criteria given, not the reasoning that produced the change. `/code-review` is the bundled correctness check; to check the diff against a plan instead, name the work, the plan, and what counts as a finding.

  On scoping that reviewer, the live page warns that a reviewer prompted to find gaps will usually report some even when the work is sound, and that chasing every finding leads to over-engineering: *"Tell the reviewer to flag only gaps that affect correctness or the stated requirements, and treat the rest as optional."*

  **Deviation adopted in this plugin's home repo (claude-marketplace, `docs/MODEL-NOTES.md`):** ask for all findings and filter them afterwards, since a model that follows scoping instructions literally reports *less* when its remit is pre-narrowed — the page's intent survives, only the filter moves from reviewer to requester.

## 8. Avoid common failure patterns

Five named patterns. If the rough prompt is walking into one, say which:

| Pattern | Fix |
|---|---|
| **The kitchen sink session** — one task, then something unrelated, then back again. Context full of irrelevance. | `/clear` between unrelated tasks. One task per prompt. |
| **Correcting over and over** — context polluted with failed approaches. | After two failed corrections, `/clear` and write a better initial prompt. |
| **The over-specified CLAUDE.md** — too long, so Claude ignores half of it. | Prune ruthlessly. If Claude already does it right unprompted, delete the rule or convert it to a hook. |
| **The trust-then-verify gap** — a plausible implementation that doesn't handle edge cases. | Always provide verification. If you can't verify it, don't ship it. |
| **The infinite exploration** — "investigate X" unscoped; Claude reads hundreds of files. | Scope the investigation, or push it into subagents. |

## 9. Develop your intuition

These patterns are starting points, not rules. Sometimes context *should* accumulate because the history is valuable; sometimes planning should be skipped because the task is exploratory; sometimes a vague prompt is exactly right because the user wants to see how Claude interprets the problem before constraining it. When a rewrite would fight the user's stated intent, the intent wins — say why rather than tightening on reflex.

## 10. Related resources

The live page links out to: *How Claude Code works* (the agentic loop and context management), *Extend Claude Code* (skills, hooks, MCP, subagents, plugins), *Common workflows*, and *CLAUDE.md*. Reach for them when a rewrite needs mechanism detail this checklist deliberately doesn't carry.
