# Product Requirements

## Problem

Claude Code skills and plugins built for personal use tend to live scattered across machines, chat histories, and one-off folders. There's no single place to version them, validate them, or install them by name. A plugin **marketplace** solves this: one manifest the Claude Code CLI can read, one repo to maintain.

## Target users

- **Primary:** the owner (PedroHenriqueNS), installing these plugins across their own machines.
- **Secondary:** anyone the repo is shared with who wants to `/plugin install <name>@pedrohenriquens`.
- **Tertiary (always):** the AI agents that work *on* this repo — they are first-class consumers of the living docs here.

## Goals

- Distribute a curated set of Claude Code plugins from a single repo via the standard marketplace mechanism.
- Keep every plugin installable both locally (path) and remotely (GitHub `owner/repo`) with no per-plugin packaging step.
- Keep manifests valid (`claude plugin validate`) and versions in sync between each `plugin.json` and its `marketplace.json` entry.

## Non-goals

- Not a public, general-audience marketplace — it's personal, though shareable.
- No application code, server, build pipeline, or runtime. If a plugin ever needs compiled code, that's a per-plugin concern, not the marketplace's.
- Not a replacement for upstream sources of derived content (e.g. `marketing-skills` — see [../NOTICE](../NOTICE)).
- No automated publishing/CI yet (see [ROADMAP.md](./ROADMAP.md)).

## Success metrics

- `claude plugin validate .` and `claude plugin validate ./plugins/<name>` pass for the marketplace and every plugin.
- Every plugin installs by name from the marketplace without manual file copying.
- A new contributor (or agent) can add a plugin correctly by reading [CONVENTIONS.md](./CONVENTIONS.md) alone.

## Constraints

- Marketplace name must not start with `claude-`/`anthropic-` (reserved) — hence internal name `pedrohenriquens` while the repo/folder is `claude-marketplace`.
- Manifest shape is dictated by the Claude Code plugin spec, not by us — see [STACK.md](./STACK.md).
- Derived content must preserve attribution and respect upstream licenses before public distribution.
