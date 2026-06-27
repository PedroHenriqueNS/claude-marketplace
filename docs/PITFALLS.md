# Pitfalls

Gotchas and non-obvious constraints — past failures and how they were resolved. Forward-looking *rules* live in [CONVENTIONS.md](./CONVENTIONS.md); this file records the failure modes that motivated them. Each entry is dated.

## 2026-06-26 — Reserved marketplace name prefix

**Symptom:** marketplace named `claude-*` was rejected — `claude-*` and `anthropic-*` are reserved by Claude Code.

**Resolution:** the internal marketplace **name** is `pedrohenriquens` (used in the install suffix `@pedrohenriquens`), while the repo/folder stays `claude-marketplace`. They intentionally differ. See git history (`d275a79`, `e4f6c07`).

**Apply:** never start a marketplace `name` with `claude-`/`anthropic-`. The install suffix follows the marketplace `name`, not the folder.

## 2026-06-26 — Version written in two places

**Symptom:** a plugin's `version` lives in both `plugin.json` and its `marketplace.json` entry; they can silently drift, and installs then pick up a stale/wrong version.

**Resolution:** treat the two as one fact — bump both in the same commit. Nothing enforces this yet except review and `claude plugin validate`. A CI check is planned (see [ROADMAP.md](./ROADMAP.md) Phase 2).

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
