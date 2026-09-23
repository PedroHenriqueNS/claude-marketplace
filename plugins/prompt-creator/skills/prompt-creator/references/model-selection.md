# Model and effort selection for dispatched work (offline fallback)

> Distilled from <https://code.claude.com/docs/en/model-config> and <https://code.claude.com/docs/en/sub-agents> on 2026-09-23. This file is the **fallback only** — when the live fetch works, the live pages win. If you are reading this because a fetch failed, tell the user the guidance may be stale.

The best-practices page is the prompt rubric, but it carries no model-tier guidance: its single mention of a tier is a bare `model: opus` line inside a subagent frontmatter example, never justified. The tiers, the effort scale, and the mechanism that resolves them live on the two pages above.

The constraint that makes this matter: **an agent with no model named inherits one.** An unassigned prompt is not neutral — it silently runs every dispatched agent on whatever the user happened to have selected, which is how a top-tier model ends up doing a file-inventory sweep and a cheap one ends up doing architectural review.

Each section below names the live page and section it distills, so any claim here can be traced back and re-checked against the source. They are grouped by source page rather than strictly interleaved in page order. Sections 7 and 8 are this skill's own synthesis and are marked as such.

## 1. Model aliases (`model-config` › Available models)

An alias selects model settings without pinning a version number:

| Alias | Behavior |
|---|---|
| `default` | Clears any override, reverting to the account's runtime default. Not itself a model alias. |
| `best` | Latest Fable where available, otherwise the same model as `opus`. |
| `fable` | Latest Fable, for the hardest and longest-running tasks. |
| `opus` | Latest Opus, for complex reasoning tasks. |
| `sonnet` | Latest Sonnet, for daily coding tasks. |
| `haiku` | The fast, efficient Haiku model, for simple tasks. |
| `sonnet[1m]` / `opus[1m]` | The same model with a 1M-token context window, for long sessions. |
| `opusplan` | `opus` during plan mode, then `sonnet` for execution. |

Those one-line behaviors are the closest thing either page offers to a task-fit rubric — read them as the axis to justify against.

Aliases **float**: which version `opus`/`sonnet` resolve to varies by provider (Anthropic API, Claude Platform on AWS, Bedrock, Google Cloud's Agent Platform and Microsoft Foundry do not all resolve alike). A full model ID such as `claude-opus-5` pins it **on the Anthropic API**; Bedrock wants an inference profile ARN, Foundry a deployment name, so a pinned ID is not portable. In a rewritten prompt, prefer the alias — it survives model releases, and the prompt is being handed to a user whose provider you don't know — unless the user needs reproducibility, in which case pin the ID and say why.

## 2. Choose an effort level (`model-config` › Adjust effort level)

Effort is a **second, independent dial**: it controls adaptive reasoning — whether and how much the model thinks per step — not which model runs. Assigning a model without considering effort leaves half the decision on the table.

| Level | When to use it |
|---|---|
| `low` | Short, scoped, latency-sensitive tasks that are not intelligence-sensitive. |
| `medium` | Cost-sensitive work that can trade off some intelligence. The default on Opus 5.5. |
| `high` | Balances token usage and intelligence. **The default** on every model except Opus 5.5 and Opus 4.7. |
| `xhigh` | Deeper reasoning at higher token spend. The default on Opus 4.7. |
| `max` | Demanding tasks; shows diminishing returns and is prone to overthinking. Test before adopting broadly. |
| `ultracode` | A Claude Code setting, not a model level: `xhigh` reasoning plus a dynamic workflow planned per substantive task. |

Effort support is per model, and **a model not listed as supporting effort does not support it at all** — Fable 5.1/5, Opus 5.5, Opus 5, Sonnet 5, Opus 4.8 and 4.7 take all five levels; Opus 4.6 and Sonnet 4.6 take all but `xhigh`; **Haiku is not on that list, so do not pair an effort level with Haiku.** An unsupported level falls back to the highest supported level at or below it. **The scale is calibrated per model**, so `high` on Sonnet 5 and `high` on Opus 5 are not the same underlying value — never justify a level by comparing across models.

An assigned level can also run lower than named: a `maxEffortLevel` setting (Claude Code v2.1.267+, for every model or per model) or an organization's effort cap makes any higher level run at the cap — a subagent's or skill's `effort` frontmatter included.

For one-off depth without changing a setting, the keyword `ultrathink` anywhere in a prompt requests deeper reasoning for that turn. Other phrasings ("think hard", "think more") are passed through as ordinary text and are **not** recognized — don't write them into a rewrite expecting an effect.

## 3. Choose a model (`sub-agents` › Configure subagents)

A subagent's `model` field accepts a **model alias** (`sonnet`, `opus`, `haiku`, `fable`), a **full model ID**, or **`inherit`** (the main conversation's model).

Claude Code resolves a subagent's model in this order, first match winning:

1. The per-invocation `model` parameter Claude passes when it spawns the subagent.
2. The subagent definition's `model` frontmatter, where `inherit` selects the main conversation's model.
3. The `CLAUDE_CODE_SUBAGENT_MODEL` environment variable, if set to an alias or ID.
4. The main conversation's model.

Step 1 is the one a **prompt** can reach. A rewritten prompt cannot edit `.claude/agents/*.md` frontmatter mid-run, so naming the model in prose — "run the inventory sweep on Haiku" — is what normally lands as the per-invocation parameter. Say it per agent, not once for the batch. The exception is `CLAUDE_CODE_SUBAGENT_MODEL_FORCE` (below): while it is on, Claude cannot pass a model at all and every assignment in the prompt is ignored.

Related mechanics worth knowing before writing a claim about them:

- `CLAUDE_CODE_SUBAGENT_MODEL` is only a **default**; a definition's `model` and a per-invocation parameter both beat it. To force one model across every subagent, teammate, and workflow agent, `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` must be set as well — which then ignores every `model` field, built-ins included.
- Values are checked against an organization's `availableModels` allowlist; a blocked family alias falls to the newest permitted version of that family, and anything else falls to the inherited model; in interactive sessions Claude Code shows a warning naming both.
- A **fork** — the subagent type that inherits the whole conversation — runs on the main session's model, so name models for fresh subagents, not forks.
- A family alias (`opus`, `sonnet`) named for a subagent resolves to the main conversation's exact model when the session is already on that family, not to the version the alias points to.
- Subagents **inherit the main conversation's extended thinking** setting. There is no per-subagent thinking switch.
- `/tasks` shows which model each running subagent is on, plus its effort level when the definition sets one. That is the check to write into a prompt whose model assignments matter.

## 4. Where an assignment is written (`sub-agents` › Write subagent files)

The two relevant frontmatter fields on a subagent definition:

| Field | Meaning |
|---|---|
| `model` | `sonnet`, `opus`, `haiku`, `fable`, a full model ID, or `inherit`. Omitted → the resolution order in §3. |
| `effort` | Effort level while this subagent is active. Overrides the session level but **not** `CLAUDE_CODE_EFFORT_LEVEL` (that precedence is stated on `model-config`, not here). Defaults to inheriting from the session. |

The same keys are accepted in the `--agents` JSON flag alongside `description`, `tools`, `permissionMode`, `maxTurns`, `isolation`, and others. A rewrite that proposes a *reusable* worker should say the assignment belongs in the definition; a rewrite that dispatches ad-hoc should name the model inline.

## 5. Built-in subagents and their models (`sub-agents` › Built-in subagents)

These are worked examples of tiering by task, and they matter because a rewrite that dispatches to a built-in inherits these rules rather than setting them:

- **Explore** — read-only search and analysis. Inherits the main conversation's model, **capped at Opus on the Claude API**, so it never runs on a more expensive tier than the session already chose. To hold exploration on a cheap tier, define a user or project subagent named `Explore` with `model: haiku`; it overrides the built-in and keeps its own field.
- **Plan** — read-only research during plan mode. Inherits.
- **general-purpose** — every subagent tool; follows the full §3 order.
- **statusline-setup** runs on **Sonnet**; **claude-code-guide** runs on **Haiku**. Anthropic ships a docs-lookup agent on the cheapest tier and a config-writing agent on the middle one — the same reasoning a rewrite should apply.

Explore and Plan skip CLAUDE.md and the parent session's git status to stay fast; every other built-in and custom subagent loads both, unless its definition sets `omitClaudeMd` (Claude Code v2.1.271+) to skip the user, project and local CLAUDE.md files.

## 6. When dispatching is right at all (`sub-agents` › Work with subagents)

Assigning a model to an agent that shouldn't exist is a wasted rewrite. The page's split:

**Use subagents when** the task produces verbose output the main context doesn't need, tool restrictions or permissions should be enforced, or the work is self-contained and returns a summary. Named patterns: isolating high-volume operations (test runs, log processing, doc fetches), parallel research across independent areas, and chaining one subagent's result into the next.

**Use the main conversation when** the task needs frequent back-and-forth, several phases share significant context, the change is quick and targeted, or latency matters — a non-fork subagent starts cold and must gather context first.

Two limits to respect: results returning from many detailed subagents can themselves consume significant context, and nesting is capped at three layers below the main conversation by default (`CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH`; `1` turns nesting off).

## 7. Applying this in a rewritten prompt (this skill's synthesis)

The assignment step fires **only** when the rewritten prompt dispatches subagents, parallel agents, or a workflow. A single-agent prompt gets no model line — adding one is noise, and it invites the user to over-specify a session that has exactly one model anyway.

When it does fire, every dispatched agent gets a named model and **one clause** of justification. The clause is what makes it a decision rather than a decoration; it also gives the user something to disagree with. Justify from §1's alias descriptions and the cost-versus-judgment axis — never from invented benchmarks or a claimed measurement (see §8).

A rough shape, not a template to paste:

> Fan out four subagents. Run the three inventory sweeps on **Haiku** — mechanical file listing, no judgment. Run the architectural review on **Opus** at `xhigh` effort — it has to weigh trade-offs across everything the sweeps return.

Two failure modes to name in *what changed & why* when they apply:

- **Silent inheritance** — the original prompt named no models, so every agent would have run on the session's model. This is the default finding.
- **Uniform assignment** — the original named one model for the whole fan-out, which is the same failure with extra words unless the agents genuinely do the same kind of work.

## 8. What these pages do not say (this skill's synthesis)

Be honest about the edge of the evidence:

- The **best-practices page carries no tier rubric.** Its one tier mention is `model: opus` in a `security-reviewer` frontmatter example, with no reason given. Don't cite it as guidance.
- **`model-config` defers task-fit to a blog post** — *Choosing a Claude model and effort level in Claude Code*, <https://claude.com/blog/claude-model-and-effort-level-in-claude-code>. Neither doc page carries a task-type → tier table. If a rewrite needs more than §1's one-liners, that link is where to go; it is outside this fallback's scope.
- There is **no published benchmark** in these pages mapping task categories to models. A justification clause should read as reasoning ("mechanical, no judgment required"), never as a measured claim ("Haiku is 3× cheaper and equally accurate here").
- Model lineups and alias resolution change with releases. If the date at the top of this file is old, the tier names may have moved — say so rather than asserting a lineup.
