# Working with the Linear MCP tools

This plugin is a prompt layer over whatever Linear MCP server the session exposes. It does not reimplement the Linear API, and it deliberately **names no tools** — prefixes differ between a plugin install, the claude.ai connector, and a directly configured server, and tool names change upstream.

## Before anything

**No Linear tools in the session → stop.** Tell the user to install and authenticate a Linear MCP server. Do not fall back to the web UI, a CLI, a guess, or remembered state.

**If the session exposes Linear's own agent-skill tools** (something that lists or fetches Linear agent skills), read the relevant one before a non-trivial write. It is Linear's current documentation of its own API and beats anything memorized.

## Discover, then act

Users speak in names; the API works in IDs. Resolve one to the other at use time, every time:

1. List the entity type you are about to reference — teams, workflow statuses, labels, projects, templates, users.
2. Match by name, case-insensitively. On a near-miss or multiple candidates, show them and ask — do not pick the closest.
3. Use the ID that came back. Never construct an ID, and never reuse one from an earlier session.

Search before you create. If an issue or project for this work plausibly already exists, find it and offer it rather than filing a duplicate.

## Confirm before writing

Show every mutating call before making it: the entity, the exact field values, and where it lands. Write only after the user approves. This covers creates, updates, status moves, comments, links, and attachments.

Read-only calls need no confirmation — gather freely.

## Report what changed

Report the identifier and URL the tool returned, and the fields actually set. Never claim a write that no tool result confirms; if a call failed, say which one and what state that leaves things in.
