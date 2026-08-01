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
