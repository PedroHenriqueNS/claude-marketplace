---
name: skill-auditor
description: Use this skill when the user asks to audit, review, analyze, improve, or optimize their Claude skills configuration. Triggers include phrases like "review my skills", "improve my skills", "audit my Claude setup", "what skills should I have", "analyze my .claude folder", or requests to suggest new skills for the current project. Also use when the user wants recommendations on skills to add, remove, consolidate, or rewrite based on how their project actually works.
---

# Skill Auditor

Analyze a project and its existing Claude skills to produce evidence-based recommendations for improvements, additions, and new skills.

## Process

Work through three phases in order. Show findings from Phase 1 to the user and wait for confirmation before continuing to Phase 2 and 3.

### Phase 1: Discovery

**Map the project:**
- Identify tech stack, frameworks, languages, major dependencies
- Detect project type (web app, CLI, library, monorepo, etc.)
- Note build tools, test frameworks, linters, CI/CD setup
- Identify recurring patterns in file organization, naming, architecture

**Inventory existing skills:**
- Check `.claude/skills/`, `~/.claude/skills/`, `CLAUDE.md`, `.cursorrules`, and similar locations
- For each skill found, summarize its purpose, trigger conditions, and instructions
- Note dependencies or overlaps between skills

**Identify workflows and pain points:**
- Scan recent commits and PR descriptions for recurring tasks
- Look for repeated code patterns suggesting manual work being redone
- Grep for TODO/FIXME/HACK comments hinting at systemic issues
- Review README and docs for documented conventions not yet codified as skills

Present a concise discovery summary and ask the user to confirm before proceeding.

### Phase 2: Analysis

For each existing skill, evaluate how well it fits the project:
- **Relevance** — matches how the project actually works today
- **Clarity** — triggers specific enough to fire, broad enough not to miss cases
- **Completeness** — no gaps, outdated examples, or missing edge cases
- **Conflicts** — no contradictions with other skills or current conventions
- **Redundancy** — doesn't duplicate another skill or well-known defaults

Then check it against the mechanics that decide whether a Claude Code skill actually *works* — these are the highest-leverage and the easiest to get wrong:
- **Frontmatter** — valid YAML (malformed metadata silently disables model-triggering); `name` matches the directory; required `name` + `description` present.
- **Description** — it is THE trigger mechanism. States both *what* the skill does and *when* to use it, with the natural phrasings a user would type — specific enough not to over-trigger, pushy enough not to under-trigger, dense rather than padded against the shared description budget. (Run `/doctor` to see if any descriptions are being shortened or dropped.)
- **Context cost** — SKILL.md stays in context once triggered, so every line is recurring cost. Keep it lean (well under ~500 lines), imperative, and free of WHY-narration. Bulky reference material, large templates, and deterministic logic belong in `references/`/`assets/`/`scripts/`, loaded on demand — not inlined. Reference files over ~300 lines should carry a table of contents.
- **Invocation fit** — `disable-model-invocation: true` for deliberate manual-only actions; `context: fork` only when the skill doesn't need the live conversation.

### Phase 3: Recommendations

Produce a report with three sections:

**A. Improvements to existing skills**
For each: file path, specific issues with citations (line numbers, code examples), concrete proposed changes (diff-style where useful), priority with justification.

**B. Skills to adopt from established sources**
Skills from Anthropic's library or community repos that fit this project. For each: name, source, project-specific justification tied to observed evidence, what it replaces or complements.

**C. New skills to create**
For gaps not covered elsewhere. For each: name, trigger conditions, problem it solves (referencing observed patterns), a complete draft ready to save as SKILL.md, expected impact.

## Rules

- **Evidence over opinion** — every recommendation must cite specific files, commits, or patterns observed. No generic advice.
- **Respect what works** — don't suggest changes to functioning skills just to have something to say.
- **Scope awareness** — prefer fewer, higher-leverage recommendations over exhaustive lists.
- **Actionable output** — drafts must be ready to commit, not sketches.
- **Checkpoint before drafting** — always confirm Phase 1 findings with the user before moving to analysis and recommendations. This catches misreads early.

## Output format

Use markdown with clear section headers. For new skill drafts, wrap them in fenced code blocks with the filename as a comment on the first line so the user can copy-paste directly.