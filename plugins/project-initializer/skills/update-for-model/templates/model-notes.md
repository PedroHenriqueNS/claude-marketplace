# Model notes — <Model Name>

> This project's agent documentation is tuned for **<Model Name>** (`<api-id>`). Sourced from Anthropic's live docs on **<YYYY-MM-DD>** — see [Sources](#sources-and-staleness). Everything here is the **delta** for this model: guidance that is true of every Claude model belongs in the normal docs, not here. Targeting a different model? Re-run `update-for-model` — do not hand-edit this file into a second model's notes.

## What changes on this model

Only behaviors the live docs document as different for this model, each paired with the concrete adjustment for this project. Delete rows that don't apply; do not invent rows.

| Behavior on <Model Name> | What to do differently here |
|---|---|
| <e.g. follows instructions more literally than its predecessor> | <e.g. state requirements as commands, not preferences — "run X and paste the output", not "it'd be good to verify"> |
| <behavior> | <adjustment> |

## Harness settings

How this model is selected and configured in Claude Code for this project — model alias/ID, effort or thinking configuration, any env vars. Include only settings that differ from the default or from the previous target.

> TODO: fill from the model-config page, or delete this section if nothing here differs.

## Prompting adjustments

The changes above, applied to *this project's* actual workflows — the commands in `AGENTS.md`, the verification gate, the review step. Concrete and repo-specific; a generic restatement of the docs is worse than nothing.

> TODO: tie each adjustment to a real workflow in this repo.

## Not affected

Named rules and workflows this model does **not** change. This section exists to prevent over-correction: without it, the next contributor re-tunes things that were already right.

## Sources and staleness

Fetched <YYYY-MM-DD>:

- Models overview — <url>
- Prompting guidance for <Model Name> — <url>
- Migration guide — <url>
- Claude Code model config — <url>

<Note here if any fetch failed and this file was written from the bundled fallback — that makes it stale by construction.>

Model docs change with every release. If the fetch date above is old, or the project has switched models, re-run `update-for-model` rather than trusting this file.
