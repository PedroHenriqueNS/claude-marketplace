<!--
Template for docs/practices/delivery.md: CI, releases, deploys, dependencies and cost.
Write it in the owner's language. Keep a line marked (option: <name>) only when the owner
turned that option on in the proposal, and drop the marker. Delete these comments.
-->

# {{Project}} — Delivery practices

Read by every lead and specialist who touches CI, releases, deploys, infrastructure or dependencies.

## Environments and deploys

- A release reaches staging first. It reaches production only through a separate promotion, after it was tested in staging. No run deploys to both.
- Every deploy, of whatever kind, runs only from the release workflow: no deploy by hand, and no deploy command in a list of owner steps.
- Every production publish comes from a committed tree and records its commit.

## CI

- CI runs only what a change touches (and what depends on it). The full verification runs locally, and passes before a pull request leaves draft.
- An agent pushes once per finished task or round of fixes, so one push means one CI run.
- A timeout or limit is never raised to make a run pass. Going over it is a defect to find and fix in the same branch: a slow run is read package by package, never accepted.
- Rules that code can't show (config flags, the script names a runbook calls) are held by a config test.

## Dependencies

- A new dependency is pinned exactly, taken at a version old enough to have been vetted, and checked for license, install scripts and provenance. It enters the stack doc with its license in the same commit. A new scanner or tool needs the owner's yes.
- An agent never relaxes a supply-chain or safety setting. If a tool writes an exemption, the agent restores the file and reports it.

## Cost

- (option: minimal-cost) Spend only what is indispensable. Nothing recurring (a job on every push or merge, a scheduled run) is recommended without its usage cost stated against the plan's limits. A paid service is subscribed on the day of its first use, not before.
- (option: telemetry-off) Development tools' usage telemetry is switched off in the repository's scripts; any outbound call that remains is documented.
