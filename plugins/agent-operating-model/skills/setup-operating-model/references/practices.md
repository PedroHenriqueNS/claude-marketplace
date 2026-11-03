# Area practices

How agents should work on a kind of thing (screens for non-expert users, APIs, deploys, legal texts…), generalized from the owner's teachings in a project that ran a generated model. The plugin is not present when the agents work, so these rules are written into the project as `docs/practices/<area>.md`, one file per justified area, from [../templates/practices/](../templates/practices/). The leads and specialists of that area list the file under **Read first**. The protocol (`docs/OPERATING-MODEL.md`) stays general.

## Which files a project gets

| Justified area or signal | Practices files |
|---|---|
| An app with a user interface (web, mobile, desktop front-end) | `ui.md`, `design.md` |
| A design or brand area (`design/`, `brand/`) | `design.md` |
| An API, server or worker app | `backend.md` |
| Infra and CI | `delivery.md` |
| Risk data (auth, personal data, payments) | `security.md`, plus `legal.md` when privacy or consent text exists |
| A legal area (`legal/`, privacy or terms pages) | `legal.md` |
| A marketing or content area, or media generation | `marketing.md` |
| Research, support or finance work (`research/`, `support/`, `finance/`, or the owner names it) | `product.md` |

A file serves every area that maps to it, and is proposed once. Each proposed file is one line in the proposal's Files list.

## Options

Lines marked `(option: <name>)` in a template are off by default. List each option of the proposed files in the proposal's editable defaults, off until the owner turns it on; keep the line only when it is on.

| Option | File | What it adds |
|---|---|---|
| `mobile-drawers` | `ui.md` | Bottom drawers instead of modals on phones; zoned dense dialogs on desktop |
| `motion` | `ui.md` | Every state change animates; reduced motion gets a crossfade; measured under CPU throttling |
| `ai-visibility` | `marketing.md` | A monthly reading of a fixed question set in public AI assistants |
| `coverage-baseline` | `backend.md` | Coverage measured as a baseline first, gated in the next milestone |
| `minimal-cost` | `delivery.md` | Nothing recurring without its cost against the plan's limits; paid services subscribed on first use |
| `telemetry-off` | `delivery.md` | Development tools' telemetry switched off in the repository's scripts |

## Writing them

- Where the project's own `CONVENTIONS.md` or docs already hold a rule, the practices file points at it instead of restating it, and the project's rule wins on conflict.
- Drop a section whose work the project does not have (for example, Tenants in a single-tenant API), and a heading an option left empty.
- In update mode, follow [update-mode.md](update-mode.md).
