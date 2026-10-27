# Model and effort

Source: the Claude Code [sub-agents](https://code.claude.com/docs/en/sub-agents) page, checked 2026-10-26. Re-check it before changing this file.

## How Claude Code resolves them

- **Model:** a per-invocation `model` parameter beats the agent file's `model`, which beats `CLAUDE_CODE_SUBAGENT_MODEL`. With none set, the agent inherits the main conversation's model.
- **Effort:** a per-invocation `effort` parameter overrides the file's `effort` field and needs Claude Code 2.1.292 or later. `CLAUDE_CODE_EFFORT_LEVEL` overrides both.
- A family alias blocked by an organization allowlist resolves to that family's newest permitted version.

## The rule: the dispatcher chooses, the file holds a floor

Every spawn sets `model` explicitly, and sets `effort` explicitly where the CLI supports the parameter. The per-task table the dispatcher uses lives in [../templates/operating-model.md](../templates/operating-model.md) § Models and effort, the single place it is written.

Every generated agent file also sets a floor in its frontmatter, so a spawn that omits the parameters (or a CLI older than 2.1.292) lands on a sane value instead of inheriting the session's model:

| Role | `model` | `effort` |
|---|---|---|
| Lead | `opus` | `medium` |
| Read-only reviewer or auditor | `opus` | `high` |
| Logic or design specialist | `opus` | `medium` |
| Mechanical specialist (docs, config, ports) | `sonnet` | `medium` |

- `haiku` is never a floor. A dispatcher may pick it explicitly, only for a checkable lookup or for running a gate and summarizing it.
- Name models by alias (`opus`, `sonnet`, `haiku`), never by full ID, so the files don't go stale at each release.
- When unsure whether a specialist is logic or mechanical, use the logic floor.
