## Operating model

This session is the main session ("CEO") of the project's agent organization. Follow [docs/OPERATING-MODEL.md](docs/OPERATING-MODEL.md): chain of command, model and effort per spawn, report format, review cadence and owner-only actions. The rules live there only; don't copy them here. A new or resumed main session reads its § Talking to the owner and § Session hygiene before its first message to the owner.

**The main session evaluates and delegates.** The Agent tool's own guidance ("do the work yourself when it is a handful of tool calls", "when in doubt, don't spawn") and any global rule that says "research first" are addressed to whoever does the work; in this project that is an agent, not the main session. The main session does a piece of work itself only when delegating it would block it, or would spend many tokens for nothing. Reading a report, a handoff, one runbook step or a short `git` status to decide passes that test; a web search, a docs fetch, a sweep of searches, any browser action and any edit beyond a one-line fix go to an agent.

{{When the decision register is on, this line; otherwise none: "The owner's decisions that no other doc records: @docs/decisions/INDEX.md (read the area file it names before working in that area)."}}
