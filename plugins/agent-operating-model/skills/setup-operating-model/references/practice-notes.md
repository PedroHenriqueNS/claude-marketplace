# Practice notes

Notes from running a generated model day to day. They depend on the host app or on the project's pull-request flow, so they are not written into the protocol; add the ones that fit to the closing report's next steps.

## A lead hands back while a resumed child still runs

Claude Code documents that a child resumed with `SendMessage` runs in the background, and that in an interactive session the agent that resumed it waits for its result. In practice, a host app can remind a lead to hand back while such a child still runs, and leads then handed back early, leaving the child working alone (observed in one project's agent review: most early hand-backs followed that reminder, and almost all of them involved a resumed child). The protocol's `BLOCKED: waiting for <child id>` status and the "one blocking command, no polling" rule are the answer; this note is the evidence.

## Main-session rotation in a desktop app

Some apps start a new session from a card that can end up nested under the session that created it. The protocol says the next main session is a new top-level session; in such an app, the incoming session checks where it sits and moves itself to the top level before taking over. The incoming half carries the rotation: it reads the handoff, confirms the outgoing session is closed or archived, and only then talks to the owner.

## Watch a ready pull request until it merges

For projects where the owner merges pull requests: when a PR becomes ready for the owner, the session that made it ready arms a watch that ends on the merge. A new or resumed session lists the open PRs and re-arms their watches, since a watch dies with its session.
