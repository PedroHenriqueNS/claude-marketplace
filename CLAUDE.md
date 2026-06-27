# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Primary reference:** See @AGENTS.md for the complete guide — project overview, stack, workflows, conventions, and pitfalls.

## Claude-specific notes

- This repo IS a Claude Code plugin marketplace. When testing changes, install locally with `/plugin marketplace add <path>` then `/plugin install <name>@pedrohenriquens` — the install suffix is the marketplace `name` (`pedrohenriquens`), not the folder name.
- There is no code to run or build. The only verification gate is `claude plugin validate` — run it after any manifest or `SKILL.md` change.
- A plugin's `version` lives in two files (`plugin.json` and `marketplace.json`); always change both together.

## Living documentation

Keep these files current as the project evolves:
- @AGENTS.md
- @docs/ARCHITECTURE.md
- @docs/CONVENTIONS.md
- @docs/FEATURES.md
- @docs/PITFALLS.md
- @docs/PRD.md
- @docs/ROADMAP.md
- @docs/STACK.md
- @docs/SUMMARY.md

Update relevant docs whenever making changes that affect architecture, features, stack, conventions, or reveal new pitfalls.
