# Summary

`claude-marketplace` is a personal [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) — a monorepo that owns and distributes a set of Claude Code skills and plugins. The catalog (`.claude-plugin/marketplace.json`) lists seven plugins whose `source` paths all point inside this same repo, so adding the marketplace makes every plugin installable. There is no application code, build step, or runtime: the entire project is Markdown skill content plus JSON manifests, validated with `claude plugin validate`.

**Owner:** PedroHenriqueNS · **Marketplace name:** `pedrohenriquens` · **Status:** local-only (no remote yet).

**Top priorities:** keep manifests valid and versions in sync, then push to GitHub for remote install.

## Read next

- [docs/PRD.md](./PRD.md) — why this exists and what "done" means
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) — how the catalog, plugins, and skills fit together
- [docs/FEATURES.md](./FEATURES.md) — what each plugin does
- [docs/STACK.md](./STACK.md) — the (deliberately minimal) tech stack
- [docs/ROADMAP.md](./ROADMAP.md) — what ships next
- [AGENTS.md](../AGENTS.md) — the contributor/agent guide
