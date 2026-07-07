# claude-marketplace

A personal [Claude Code plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) — a monorepo that owns and distributes my Claude Code skills and plugins.

**Owner:** PedroHenriqueNS · **Repo:** [github.com/PedroHenriqueNS/claude-marketplace](https://github.com/PedroHenriqueNS/claude-marketplace) (public) · changes land via PR with a CI validation gate.

## Plugins

| Plugin | What it does |
|--------|--------------|
| [`project-initializer`](plugins/project-initializer) | Scaffold a project's living agent docs (AGENTS.md, CLAUDE.md, docs/*). |
| [`to-prd`](plugins/to-prd) | Turn the current conversation into a feature-level PRD and publish it. |
| [`azure-devops-card`](plugins/azure-devops-card) | Draft Azure DevOps work-item titles & descriptions (pt-BR). |
| [`skill-auditor`](plugins/skill-auditor) | Audit/improve your Claude skills against best practices. |
| [`tsconfig-upgrade`](plugins/tsconfig-upgrade) | Safely upgrade `tsconfig.json`, pre-flighting breaking changes. |
| [`marketing-skills`](plugins/marketing-skills) | 41 cross-referencing marketing skills (SEO, CRO, analytics, copy, ads…). Derived from a third-party repo — see [NOTICE](NOTICE). |
| [`nestjs-api-architect`](plugins/nestjs-api-architect) | Build, maintain & scaffold NestJS APIs as a DDD layered system (modules, use-cases, migrations). |
| [`test-optimizer`](plugins/test-optimizer) | Diagnose & fix runaway test-run memory/OOM in Jest (NestJS), Vitest (React), Playwright. |

## Layout

```
claude-marketplace/
├── .claude-plugin/marketplace.json   # catalog (name, owner, plugin list + sources)
├── plugins/
│   ├── <plugin>/.claude-plugin/plugin.json
│   └── <plugin>/skills/<skill>/SKILL.md
└── README.md
```

Each plugin's `source` in `marketplace.json` is a relative path (`./plugins/<name>`), so the whole catalog lives in this one repo.

## Use it

> The marketplace's internal **name** is `pedrohenriquens` (used in the `@` install suffix). The GitHub repo / folder is `claude-marketplace`. They differ because Claude Code reserves `claude-*`/`anthropic-*` marketplace names.

**From GitHub:**
```
/plugin marketplace add PedroHenriqueNS/claude-marketplace
/plugin install marketing-skills@pedrohenriquens
```

**From a local clone** (e.g. when developing a plugin):
```
/plugin marketplace add /path/to/claude-marketplace
/plugin install project-initializer@pedrohenriquens
```

Installed plugin skills are namespaced: `marketing-skills:seo-audit`, `to-prd:to-prd`, etc.

## Validate after changes

Run the same gate CI runs (`.github/workflows/validate.yml`):

```
python3 scripts/check_compliance.py            # version-sync, frontmatter, links, reserved names
claude plugin validate .                       # the marketplace manifest
claude plugin validate ./plugins/<name>        # a single plugin + its skills
```

## Versioning

Each plugin carries an explicit `version` in both its `plugin.json` and its `marketplace.json` entry (kept in sync). Bump it when you want installs to pick up changes.
