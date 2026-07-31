# Workspace conventions — resolution and schema

Every skill in this plugin needs to know how one particular Linear workspace is run. That knowledge splits in two, and only one half is a file.

## Two kinds of knowledge

| Kind | Examples | Where it comes from |
|---|---|---|
| **Discoverable** | teams, workflow statuses, label groups and their values, templates, existing projects, users | The Linear MCP tools, read live at use time. Never hardcode these and never reuse an ID from a previous session. See [`linear-mcp.md`](./linear-mcp.md). |
| **Judgment** | when work is a project vs an issue, naming patterns, description shapes, what a status *means*, what to surface first | The conventions file resolved below. No API call can tell you these. |

Keeping the split honest is what lets this plugin ship generic: no team key, client name, or label string belongs anywhere in it.

## Resolution

Resolve **per section, not per file**. For each thing you need — the project-vs-issue rule, a naming pattern, a status meaning, a label group — take the first of these that declares it:

1. **`~/.claude/linear-conventions.md`** — the user's real workspace. Whatever it declares wins.
2. **The generic defaults below**, for anything that file leaves out. A workspace file is expected to be partial: the template invites deleting sections that do not apply, and a deleted section means "fall back", not "undefined".
3. **Neither declares it → ask the user.** Never guess a team, label, status, client, or template.

When no workspace file exists and the user is doing more than a one-off, offer to create one from [`../templates/workspace-conventions.md`](../templates/workspace-conventions.md). A workspace file that declares even three sections beats asking the same questions every session.

If a workspace file names something the API says does not exist — a label, status, or template — the file has drifted from reality. Say so and ask. Do not create the missing entity to make the file fit.

## Schema — what a workspace file declares

A workspace file is Markdown, read by a human and by these skills. Sections it may declare, all optional:

| Section | Answers |
|---|---|
| Team and identity | Which team is the default, and whether more than one is in play. |
| Project vs issue | The rule for choosing between them, and which way to lean when ambiguous. |
| Naming patterns | How project and issue titles are formed — including any per-category pattern (client work, internal, discovery). |
| Description shapes | The sections a project, discovery, or issue description carries. |
| Workflow statuses | The status ladder in order, and what the non-obvious ones *mean* (a status name rarely explains itself). |
| Label taxonomy | The label groups on issues and on projects, their values, and when each applies. |
| Templates | Which Linear templates exist and which kind of work each is for. |
| Views | Saved views worth reading when answering "what's next". |
| Working style | Cycles and estimates on or off; how much structure the user wants. |

## Generic defaults — when no workspace file exists

Use these only as fallbacks, and prefer discovery over assumption in every case.

- **Team** — if the workspace has exactly one team, use it. If more than one, ask; do not infer from the repo name.
- **Project vs issue** — a **project** when the work is a feature, initiative, client engagement, or discovery that will take several steps and deserves its own scope. An **issue** when it is a single execution item: a small fix, a hotfix, a bug, a chore. When genuinely ambiguous, ask — and say which way you lean and why.
- **Naming** — concise and direct. No ticket IDs, no status words, no dates in titles.
- **Statuses** — discover the team's actual workflow states. Do not assume Linear's defaults are in use or that a name means what it looks like.
- **Labels** — discover the groups that exist and apply only labels already present. **Never create a label without asking.**
- **Templates** — list them; use one when its name matches the kind of work, otherwise write a plain description.
- **Estimates and cycles** — leave them alone unless the user asks.
- **Descriptions** — practical and low-bloat. Do not invent scope, acceptance criteria, or constraints the user did not give.
