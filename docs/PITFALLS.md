# Pitfalls

Gotchas and non-obvious constraints — past failures and how they were resolved. Forward-looking *rules* live in [CONVENTIONS.md](./CONVENTIONS.md); this file records the failure modes that motivated them. Each entry is dated.

## 2026-06-26 — Reserved marketplace name prefix

**Symptom:** marketplace named `claude-*` was rejected — `claude-*` and `anthropic-*` are reserved by Claude Code.

**Resolution:** the internal marketplace **name** is `pedrohenriquens` (used in the install suffix `@pedrohenriquens`), while the repo/folder stays `claude-marketplace`. They intentionally differ. See git history (`d275a79`, `e4f6c07`).

**Apply:** never start a marketplace `name` with `claude-`/`anthropic-`. The install suffix follows the marketplace `name`, not the folder.

## 2026-06-26 — Version written in two places

**Symptom:** a plugin's `version` lives in both `plugin.json` and its `marketplace.json` entry; they can silently drift, and installs then pick up a stale/wrong version.

**Resolution:** treat the two as one fact — bump both in the same commit. Now enforced: `scripts/check_compliance.py` hard-fails on drift, and CI runs it on every PR/push (`.github/workflows/validate.yml`).

**Apply:** when bumping a plugin, grep for its version in both files before committing.

## 2026-06-26 — Relative `source` paths must stay valid

**Symptom:** each plugin's `source` in `marketplace.json` is a path relative to repo root (`./plugins/<name>`). Renaming or moving a plugin folder without updating the catalog breaks install with no obvious error at author time.

**Resolution:** keep `source` paths and folder names in lockstep; validate with `claude plugin validate .` after any move/rename.

**Apply:** moving a plugin folder is a two-file change — the folder and its `marketplace.json` `source`.

## 2026-06-26 — Derived content carries license obligations

**Symptom:** `marketing-skills` is recreated from a third-party repo. Distributing it publicly without honoring the upstream license is a real risk.

**Resolution:** provenance is recorded in [../NOTICE](../NOTICE); the obligation to review the upstream LICENSE before public distribution is gated in [ROADMAP.md](./ROADMAP.md) Phase 1.

**Apply:** before any public push that exposes `marketing-skills`, read the upstream LICENSE and honor its attribution/redistribution terms.

## 2026-06-26 — Line endings across platforms

**Symptom:** content authored on both Windows (paths like `C:/Users/...` appear in the README) and Unix can introduce mixed CRLF/LF diffs.

**Resolution:** `.gitattributes` sets `* text=auto`, normalizing to LF in the repo with native checkout per platform.

**Apply:** don't disable `text=auto`; if a diff looks like it changed every line, it's a line-ending issue, not a content change.

## 2026-07-31 — Version numbers also drift in doc prose, not just the manifests

**Symptom:** a plugin's version is duplicated in prose across `docs/FEATURES.md`, `docs/STACK.md`, and `docs/ROADMAP.md`, in addition to `plugin.json` and its `marketplace.json` entry. `scripts/check_compliance.py` only compares the two manifests, so a stale version in one of those docs passes the gate silently. This has now been caught by review twice, both times on `linear-flow`.

**Resolution:** treat the docs as part of the same fact as the manifests when bumping a version; review is currently the only thing catching drift in the prose copies.

**Apply:** when bumping a plugin's version, grep all three docs (`FEATURES.md`, `STACK.md`, `ROADMAP.md`) for the plugin name, not just the two manifests.

## 2026-09-23 — Description written in two places

**Symptom:** a plugin's `description`, like its version, lives in both `plugin.json` and its `marketplace.json` entry. Two plugins (`marketing-skills`, `nestjs-api-architect`) had drifted unnoticed. Since Claude Code 2.1.265 the Installed tab and `claude plugin details` show the marketplace text, so an edit made to `plugin.json` alone no longer reaches users.

**Resolution:** both synced to the marketplace text; `scripts/check_compliance.py` now hard-fails on description drift, as it does on version drift.

**Apply:** edit a plugin's description in both manifests in the same commit.

## 2026-09-23 — A personal skill hides the bundled one with the same name

**Symptom:** `/claude-api prompt-audit` loaded a months-old personal copy of `claude-api` (a symlink in `~/.claude/skills/`) with no `prompt-audit` subcommand. A skill in a personal or project location replaces a bundled skill of the same name, and the session silently served the old copy.

**Resolution:** the symlink was moved out of `~/.claude/skills/` for the audit and restored afterwards; the session picked up the bundled skill once its listing refreshed. `skill-auditor` now tells the user this is the likely cause when the subcommand isn't recognized.

**Apply:** if a bundled command behaves like an old version, look for a same-named skill in `~/.claude/skills/` or `.claude/skills/` before debugging the command.

## 2026-09-23 — `claude plugin eval`: an old CLI, then four defaults

**Symptom:** on Claude Code 2.1.267 every `claude plugin eval` call, `init --bare` included, exited 1 with "currently in early access". Homebrew's `claude-code` cask tracks the stable channel, which had not reached 2.1.269, the release that made the command generally available.

**Resolution:** the live [plugin-evals](https://code.claude.com/docs/en/plugin-evals) page ties that message to a build predating general availability. Switching to the `claude-code@latest` cask (2.1.280) unblocked it. Four defaults then shape every run:

- cases are read from `plugins/<name>/evals/`, not from a skill's own `evals/` folder;
- without a terminal, a run refuses a directory it has not trusted yet — pass `--trust-plugin` for your own plugins;
- an `--allow-tools` grant applies to every case in the run, so a case that must run *without* a tool (prompt-creator's `offline` case) is selected by tag and run on its own;
- the HTML report is published to claude.ai unless you pass `--no-publish`.

The first pilot run also showed the default judge (haiku) failing compliant 3–4 KB replies and passing violating ones on the same rubric. The runner's docs say to suspect the judge first when a skill fires but the with/without delta is negative.

**Apply:** check `claude --version` is ≥ 2.1.269 before debugging a suite, and run evals with `--trust-plugin --no-publish`. Read a failing run's reply (the `evidence` field in `results/<run>/aggregate-result.json`) before blaming the skill, and move long-reply checks to `regex` graders.
