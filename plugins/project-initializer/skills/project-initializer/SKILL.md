---
name: project-initializer
description: Use this skill ONLY when the user explicitly asks to initialize, bootstrap, or scaffold a new project's agent documentation. Triggers are explicit phrases like "init this project", "initialize the project", "set up AGENTS.md and CLAUDE.md", "bootstrap project docs", "scaffold the docs", or references to running a custom /init workflow. Do NOT auto-trigger on empty projects, new git repos, or missing documentation — wait for the user to explicitly invoke this. Do NOT use for updating docs in established projects.
---

# Project Initializer

Scaffold a new project with a complete set of living documentation files that both humans and AI agents can rely on. Establishes conventions that keep documentation current throughout the project's life.

## When to use

Only when the user explicitly invokes initialization with phrases like:
- "init this project"
- "initialize the project"
- "set up AGENTS.md / CLAUDE.md"
- "bootstrap the project docs"
- "scaffold docs for agents"

Do not trigger based on context alone (empty folder, missing docs, new repo). Wait for explicit invocation.

## Files to create

### Root-level

**AGENTS.md** — Primary source of truth for any AI agent working on the project. Contains:
- Project overview (one paragraph)
- Tech stack summary (link to `docs/STACK.md` for details)
- Repository structure and key directories
- Development workflow (install, run, test, lint commands)
- Coding conventions and style rules
- Commit and PR conventions
- Testing expectations
- Known pitfalls reference (link to `docs/PITFALLS.md`)
- Explicit `## Documentation maintenance` section (see below — non-negotiable)

**CLAUDE.md** — Claude Code's entry point. Stays lean, defers to AGENTS.md to avoid duplication:

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

**Primary reference:** See @AGENTS.md for the complete guide — project overview, stack, workflows, conventions, and pitfalls.

## Claude-specific notes

[Any Claude Code-specific preferences, tool usage patterns, or behaviors that don't belong in AGENTS.md. Leave empty with a TODO if nothing specific yet.]

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
```

### docs/ folder

**docs/ARCHITECTURE.md** — How the system is structured. Components, data flow, key design decisions, module boundaries. Use mermaid diagrams when they clarify structure.

**docs/CONVENTIONS.md** — Canonical home for project coding rules. Every rule that applies across the codebase (naming, call-site patterns, error shapes, banned shortcuts, library choices, branching/PR workflow) goes here. The file is the single source of truth — when AGENTS.md, CLAUDE.md, inline comments, or anyone's private notes contradict it, this file wins. New conventions land HERE in the same PR that establishes them, never buried in commit messages or AI-assistant private memory.

**docs/FEATURES.md** — What the product does. One section per feature: purpose, user-facing behavior, implementation notes, status (planned / in-progress / shipped).

**docs/PITFALLS.md** — Gotchas and non-obvious constraints — *past failures* and how they were resolved. Things that would trip up a new contributor or agent. Growing list; each entry dated. Distinct from CONVENTIONS.md, which captures forward-looking rules; PITFALLS.md captures the failure modes that motivated them.

**docs/PRD.md** — Product Requirements Document. Problem being solved, target users, goals, non-goals, success metrics, constraints. High-level and stable.

**docs/ROADMAP.md** — Phased plan: what ships in each phase, what's deferred, what's currently in-flight. Updated whenever priorities shift, milestones are reached, or new work is scoped.

**docs/STACK.md** — Detailed tech stack. Languages, frameworks, libraries with versions, infrastructure, external services, dev tools. The "what we use and why" document.

**docs/SUMMARY.md** — Short executive summary. What this project is in 3–5 sentences, current status, top priorities. First doc anyone should read.

**docs/EVENTS.md** — *Conditional, only when the project touches Kafka or RabbitMQ as a producer OR consumer.* Cross-service catalog of every routing key / topic this service **publishes** (with the consumer queues across services that subscribe to each one) **and every routing key / topic this service consumes** (with the producing service identified). See "Conditional file: docs/EVENTS.md" below for the full detection + template.

## Process

### Step 1: Survey the project

Before writing anything, inspect the working directory:
- Check which target files already exist (AGENTS.md, CLAUDE.md, docs/ARCHITECTURE.md, docs/CONVENTIONS.md, docs/FEATURES.md, docs/PITFALLS.md, docs/PRD.md, docs/ROADMAP.md, docs/STACK.md, docs/SUMMARY.md, and — if step 1.5 triggers — docs/EVENTS.md)
- Read any existing README, source code, or config files (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) to understand the stack
- Identify language/framework from file extensions and configs
- Detect monorepo shape: is there a `packages/`, `apps/`, `services/`, or sibling-services layout? If yes, plan to scaffold per-scope CONVENTIONS.md (root + each service + infrastructure layer if present) — see "Monorepo layout" below.
- If the project is empty or unclear, ask the user for: project name, one-sentence purpose, and intended tech stack before proceeding

### Step 1.5: Detect event-broker traffic (Kafka / RabbitMQ producers OR consumers)

Run this grep against the manifest files of any detected language:

```bash
grep -rEl "kafkajs|@nestjs/microservices.*Kafka|node-rdkafka|confluent-kafka|@golevelup/nestjs-rabbitmq|amqplib|amqp-connection-manager|aio_pika|kombu|github.com/segmentio/kafka-go|github.com/streadway/amqp|github.com/rabbitmq/amqp091-go" \
  . --include="package.json" --include="pyproject.toml" --include="requirements*.txt" --include="go.mod" --include="Cargo.toml" 2>/dev/null
```

Then confirm there's actual **producer OR consumer** code (not just an unused dep):
- Producer surfaces: `amqp.publish(`, `channel.publish(`, `producer.send(`, `kafka.send(`, `ClientKafka.emit(`, `*Publisher`, `*Notifier`, `*Producer`.
- Consumer surfaces: `@RabbitSubscribe`, `@ApiRabbitMessage`, `@MessagePattern`, `consumer.subscribe(`, `channel.consume(`, `*Listener`, `*Consumer`, `*Subscriber`.
- If at least one publish OR subscribe call site exists, mark this project **events-active**.

Outcome of Step 1.5:
- **Events-active = yes** → add `docs/EVENTS.md` to `TO_CREATE` (unless already present, which goes to `TO_SKIP`); also append the "Event catalog" rule to the CONVENTIONS.md scaffold (see "Conditional file" below); also append the EVENTS.md maintenance line to the AGENTS.md "Documentation maintenance" section. The catalog will document whichever side(s) are present — a pure-consumer service gets a "Events consumed" section and an empty / omitted "Events published" section, and vice versa.
- **Events-active = no** → skip EVENTS.md entirely. Do not scaffold an empty catalog.

This step is not optional — every initialization MUST run it, even if the user didn't mention messaging. The detection is cheap; the consequences of missing it (event topology hidden across N repos) are not.

Build a list of:
- `TO_CREATE`: files that don't exist yet
- `TO_SKIP`: files that already exist

### Step 2: Handle existing files

**Policy: skip-and-report.** Never overwrite, never merge, never prompt per-file.

- Only create files in `TO_CREATE`
- Report `TO_SKIP` files to the user at the end so they know what was preserved
- If the user wants existing files updated, they can ask in a follow-up — that's out of scope for this skill

### Step 3: Generate content

For each file in `TO_CREATE`, write real content — not empty scaffolds. Pull from:
- Information gathered in Step 1
- Answers to clarifying questions
- Reasonable inferences from the stack (e.g., Next.js → include standard Next.js conventions; Python → include venv/uv/poetry notes based on what's present)

Mark genuinely unknown sections with `> TODO: [specific question]` so the user knows exactly what to fill in. Do not invent facts to fill gaps.

### Step 4: Cross-link

Every doc references related docs using relative links. AGENTS.md and CLAUDE.md both point to the `docs/` folder. When information belongs in multiple places, put the detail in one file and link from the others. No duplication.

### Step 5: Initialize git (if not already)

If there's no `.git` directory:
- Run `git init`
- Create a `.gitignore` appropriate for the detected stack
- Stage all created files
- Make an initial commit: `chore: initialize project documentation`

Do NOT create a GitHub repo or push. If the user wants that, they'll ask.

### Step 6: Report

Output a summary containing:
- Tree view of files created
- List of files skipped (already existed)
- Any TODOs left for the user to fill in
- Git status (initialized / already existed / committed)

## Required content: Documentation maintenance section

Every AGENTS.md this skill creates must include this exact section verbatim. This is the mechanism that keeps the docs alive — without it, they rot.

```markdown
## Documentation maintenance

These files are living documents. When you make changes to this project, update the relevant docs in the same commit:

- Architectural change → update `docs/ARCHITECTURE.md`
- New feature or feature change → update `docs/FEATURES.md`
- Discovered a gotcha → add to `docs/PITFALLS.md`
- Stack change (new dep, version bump, service) → update `docs/STACK.md`
- Scope or requirements change → update `docs/PRD.md` and `docs/SUMMARY.md`
- New coding rule, banned shortcut, or workflow convention → add to `docs/CONVENTIONS.md` (THE source of truth — never bury rules in commit messages, AGENTS.md prose, or private notes)
- Phase reached or priorities shifted → update `docs/ROADMAP.md`

If you skip a doc update, note why in the commit message.
```

## Required content: CONVENTIONS.md scaffold

Every CONVENTIONS.md this skill creates must include this header verbatim plus stack-appropriate rule placeholders. This establishes the file as the single source of truth from day one.

```markdown
# <Project Name> — Conventions

Canonical home for project coding rules. Every rule that applies across the codebase lives here — naming, call-site patterns, error shapes, banned shortcuts, library choices, branching and PR workflow, anything else.

When a rule conflicts with what's in `AGENTS.md`, `CLAUDE.md`, the spec docs, or any inline comment, **this file wins**. The other files should be updated to match.

New conventions land HERE in the same PR that establishes them — never in commit messages, AI-assistant private notes, or buried inline comments.

---

## Languages and code style

> TODO: Document the project's language conventions (TypeScript strictness, Python type hints, Go style, etc.). Include any banned features (e.g. "no `any`", "no global state in services").

---

## Branching and PR workflow

> TODO: Document the branching model (trunk-based / GitFlow / roadmap-branch / etc.) and PR target rules.

---

## Conventional Commits

> TODO: List allowed types (feat / fix / chore / docs / refactor / test / etc.) and scopes for this project.

---

## Testing

> TODO: Document the test layout, runner, and minimum coverage expectations.

---

## Documentation maintenance

> TODO: Lift the same map from AGENTS.md so contributors see it here too.

---

## Where conventions live

| Scope | File |
|---|---|
| This file | Project-wide coding rules |
| Past failures + fixes | `docs/PITFALLS.md` |

When establishing a new convention (in code review, brainstorming, direct user instruction), add it HERE in the same PR.
```

For monorepos, this header gets duplicated (with adjusted scope) at each layer — see "Monorepo layout" below.

## Conditional file: `docs/EVENTS.md` (Kafka / RabbitMQ producers OR consumers)

Created only when Step 1.5 marks the project events-active. Skip if not.

When events-active, write `docs/EVENTS.md` by following `<this-skill-dir>/templates/generate-events-catalog.md` Phases 1–3 (detect → inventory → draft) against the surveyed codebase, then wire its cross-references using that template's Phase 4.1–4.2 append blocks. The template is the single source of truth for the catalog format, the enumeration rules (producer / consumer / self-consumed), the `_(unconfirmed)_` discipline for non-self consumer rows on the produced side, and the exact blocks to append to `docs/CONVENTIONS.md`, `AGENTS.md`, and `CLAUDE.md`. It's also a standalone artifact for non-Claude-Code agents, which is why it lives outside this file.

Three things are specific to running it inside an initialization:

- You're creating `docs/CONVENTIONS.md` in this same run, so append the template's "## Event catalog" block to it directly — the template's Phase 4.1 "stop and ask before creating CONVENTIONS.md" guard is for retrofitting an existing repo, not for a fresh scaffold.
- Add `- @docs/EVENTS.md` to the CLAUDE.md "Living documentation" list (alphabetical position) when you create CLAUDE.md.
- Don't run the template's Phase 4.4 (standalone commit) — `docs/EVENTS.md` is part of the single initial commit in Step 5.

## Monorepo layout

If the project has multiple services / apps / packages, scaffold a CONVENTIONS.md per scope, not just at the root:

```
<repo>/
├── docs/CONVENTIONS.md                          # repo-wide rules
├── infrastructure/docs/CONVENTIONS.md           # if there's an infra layer
└── <service-or-app>/docs/CONVENTIONS.md         # per service/app
```

Each scope's CONVENTIONS.md links to the others ("repo-level lives at /docs/CONVENTIONS.md; infrastructure rules at /infrastructure/docs/CONVENTIONS.md") so readers can navigate. Service-level rules override repo-level rules for that service when they conflict — say so explicitly in the service-level file's header.

If a service is pre-scaffold (directory exists but no source yet), a CONVENTIONS.md is still valuable: it captures forward-looking rules so the first scaffold pass and every subsequent contribution land on the right conventions from day one. End the file with an "Open decisions for scaffold time" section listing TBDs (package manager, styling library, test layout, etc.) that get moved into the body once decided.

## Rules

The behavior is specified in the steps above; these invariants are restated because violating them is the costly kind of mistake:

- **Explicit invocation only** — never auto-run based on project state.
- **Skip, don't overwrite** — existing files are sacred; only create what's in `TO_CREATE`, and report `TO_SKIP`.
- **Conventions live in `docs/CONVENTIONS.md`, never in private notes** — a new rule lands in the doc in the same PR; the doc is what survives session boundaries for every contributor, human or AI.
- **Local git only** — never push to a remote or create a GitHub repo unprompted.