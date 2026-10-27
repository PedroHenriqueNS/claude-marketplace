# Update mode

Applies when `.claude/agents/` or an `OPERATING-MODEL.md` already exists. The existing setup holds rules its owner's reviews produced; the job is to keep them.

## Classify

Read every existing agent file and the existing protocol, then size the project as usual. Put each agent in one bucket:

| Bucket | Meaning |
|---|---|
| **Keep** | Still justified by a signal; no change needed. |
| **Adjust** | Still justified, but needs a targeted change (for example a missing `model`/`effort` floor, a renamed path). |
| **New** | A justified area or task with no agent yet. |
| **Unused** | No current signal justifies it. |

## Propose only the delta

The proposal keeps the Step 4 shape, with the agent list grouped under the four buckets (`Keep`, `Adjust`, `New`, `Unused`), each line still ending in `Signal: \`<path>\`` (for Unused, the path that no longer exists or the reason). For every Adjust item and every change to the existing protocol or `CLAUDE.md`, show the diff.

## Writing rules

- An existing file changes only through a diff the owner approved for that file.
- **Nothing is deleted.** An Unused agent becomes a removal suggestion in the report; the owner removes it.
- Agents not in the generated format are **adopted**, never reformatted to the template. A targeted diff (such as adding a floor) is fine.
- New agents are written from the templates as in a first run.
- If the existing protocol already covers a rule, leave it; propose a diff only for a missing or contradicting rule.
