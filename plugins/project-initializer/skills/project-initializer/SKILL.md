---
name: project-initializer
description: Use this skill ONLY when the user explicitly asks to initialize, bootstrap, or scaffold a new project's agent documentation. Triggers are explicit phrases like "init this project", "initialize the project", "set up AGENTS.md and CLAUDE.md", "bootstrap project docs", "scaffold the docs", or references to running a custom /init workflow. Do NOT auto-trigger on empty projects, new git repos, or missing documentation — wait for the user to explicitly invoke this. Do NOT use for updating docs in established projects; that is the refresh-docs skill.
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

Each file has a template in this plugin's `templates/` folder holding its skeleton, its format rules and any block that must be written verbatim. Read a file's template before writing that file, and follow it.

| File | Template | What it is |
|---|---|---|
| `CLAUDE.md` | [claude-md.md](../../templates/claude-md.md) | Claude Code's entry point; imports only the core docs, links the rest |
| `AGENTS.md` | [agents-md.md](../../templates/agents-md.md) | Primary guide for any agent: hard constraints, structure, workflow, the Documentation maintenance map |
| `docs/CONVENTIONS.md` | [conventions.md](../../templates/conventions.md) | Canonical coding rules; the size rule; where conventions live |
| `docs/PITFALLS.md` | [pitfalls.md](../../templates/pitfalls.md) | One short rule per gotcha |
| `docs/PITFALLS-HISTORY.md` | [pitfalls-history.md](../../templates/pitfalls-history.md) | The full story behind each rule; nothing imports it |
| `docs/ARCHITECTURE.md` | [architecture.md](../../templates/architecture.md) | Structure, data flow, design decisions, a dated status line |
| `docs/FEATURES.md` | [features.md](../../templates/features.md) | One block per feature, with PRD and fixed status |
| `docs/ROADMAP.md` | [roadmap.md](../../templates/roadmap.md) | Phases with status and a **Done when:** line each |
| `docs/STACK.md` | [stack.md](../../templates/stack.md) | Stack detail and a pins table from the manifests |
| `docs/SUMMARY.md` | [summary.md](../../templates/summary.md) | Executive summary, dated status, top priorities |
| `docs/PRD.md` | [prd.md](../../templates/prd.md) | Problem, users, goals, non-goals, metrics, constraints |

**docs/EVENTS.md** — *Conditional, only when the project touches Kafka or RabbitMQ as a producer OR consumer.* Cross-service catalog of every routing key / topic this service **publishes** (with the consumer queues across services that subscribe to each one) **and every routing key / topic this service consumes** (with the producing service identified). See "Conditional file: docs/EVENTS.md" below.

## Diagramming policy

Diagrams in docs exist to give AI agents *parseable topology*. Mermaid is the only diagram format this skill uses, because it is plain text: it lands in the agent's context window as structured, readable tokens, it diffs cleanly in PRs, and it renders for humans in the repo's markdown viewer. An exported image (PNG/SVG) does none of this for an agent and must never be used in place of Mermaid.

Every ARCHITECTURE.md (and any other doc) created or updated under this skill follows these rules verbatim:

**1. Diagram only what warrants it.** A Mermaid diagram earns its place when the thing it depicts has branching, ordering that matters, or 4+ components whose relationships are not obvious from the code structure — AND is stable enough not to drift within weeks. If it fails any of these, do not diagram it.

**2. Everything else stays in its natural form.** A flow that fits in one sentence without a comma-splice stays prose. Lookup/reference data stays a table. Directory layouts stay ASCII trees (the indentation IS the diagram, and agents parse file paths natively). Converting these to Mermaid makes them worse.

**3. Topology in the diagram, constraints in prose.** A diagram shows what connects to what. It CANNOT carry the rules that matter most to an agent — "must be idempotent", "never retry on 4xx", "return 500 so the platform retries". Every diagram is paired with a short prose "Constraints" list directly below it for the rules the diagram can't express. A diagram is necessary-but-never-sufficient.

**4. Derive strictly from code; never invent.** Nodes and edges come only from what the code actually does. If the code is ambiguous, say so in prose rather than guessing a topology.

**5. Cap complexity.** Max ~7 nodes per diagram. If the flow is bigger, split into an overview diagram plus one diagram per sub-flow — never one dense graph. Escape special characters in labels (angle brackets, colons, slashes) so it renders. Keep node labels to ≤5 words.

**6. Pick the type by intent.** `flowchart TD` for request/processing pipelines and decision branches; `sequenceDiagram` for who-calls-whom-in-what-order (auth handshakes, event flows); `stateDiagram-v2` for entities with defined states and transitions; `erDiagram` for conceptual data models (but the real schema file is usually the better source of truth — use ERDs only for high-level models).

**7. A stale diagram is worse than none.** Because it looks authoritative, a wrong diagram actively misleads the agent. Diagrams are bound by the same living-documentation contract as conventions: when a code change alters a depicted topology, the diagram is updated IN THE SAME COMMIT. This is reinforced in the Documentation maintenance section.

When in doubt, prefer prose. Most architecture is adequately conveyed without a single diagram; the typical well-structured ARCHITECTURE.md needs only one or two.

## Process

### Step 1: Survey the project

Before writing anything, inspect the working directory:
- Check which target files already exist (every file in the table above, and — if step 1.5 triggers — docs/EVENTS.md)
- Read any existing README, source code, or config files (package.json, pyproject.toml, Cargo.toml, go.mod, etc.) to understand the stack and its pinned versions
- Identify language/framework from file extensions and configs
- Detect monorepo shape: is there a `packages/`, `apps/`, `services/`, or sibling-services layout? If yes, plan to scaffold per-scope CONVENTIONS.md (root + each service + infrastructure layer if present) — see "Monorepo layout" below.
- If the project is empty or unclear, ask the user for: project name, one-sentence purpose, and intended tech stack before proceeding. Ask too for any hard constraints, and whether the roadmap's phases are sequential, when the answers can't be read from the repo.

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
- If the user wants existing files reviewed or updated, that is out of scope here: point them at the `refresh-docs` skill in this plugin

### Step 3: Generate content

For each file in `TO_CREATE`, write real content — not empty scaffolds — in the shape its template sets. Pull from:
- Information gathered in Step 1
- Answers to clarifying questions
- Reasonable inferences from the stack (e.g., Next.js → include standard Next.js conventions; Python → include venv/uv/poetry notes based on what's present)

When writing ARCHITECTURE.md, apply the "Diagramming policy" above: identify the one or two flows that genuinely warrant a diagram, render those as Mermaid with a paired Constraints prose list, and leave everything else as prose, tables, or ASCII trees. Do not diagram for the sake of having a diagram.

Mark genuinely unknown sections with `> TODO: [specific question]` so the user knows exactly what to fill in. Do not invent facts to fill gaps — hard constraints, pins and status lines included.

### Step 4: Cross-link

Every doc references related docs using relative links. AGENTS.md and CLAUDE.md both point to the `docs/` folder. When information belongs in multiple places, put the detail in one file and link from the others. No duplication: the Documentation maintenance map lives only in AGENTS.md, and CONVENTIONS.md links to it.

### Step 5: Check sizes

Count the lines of every file you generated (`wc -l`, or read the file where the shell isn't available). Each file that CLAUDE.md imports (`AGENTS.md`, `docs/CONVENTIONS.md`, `docs/PITFALLS.md`) must be under 200 lines; if one is not, move detail into a linked file that nothing imports, then count again.

### Step 6: Initialize git (if not already)

If there's no `.git` directory:
- Run `git init`
- Create a `.gitignore` appropriate for the detected stack
- Stage all created files
- Make an initial commit: `chore: initialize project documentation`

Do NOT create a GitHub repo or push. If the user wants that, they'll ask.

### Step 7: Report

Output a summary containing:
- Tree view of files created
- List of files skipped (already existed)
- The line count of each imported file, and a note that Claude Code's combined-size warning, at startup and in `/status`, is the check for the whole imported set
- Any TODOs left for the user to fill in
- Git status (initialized / already existed / committed)

## Conditional file: `docs/EVENTS.md` (Kafka / RabbitMQ producers OR consumers)

Created only when Step 1.5 marks the project events-active. Skip if not.

When events-active, write `docs/EVENTS.md` by following `<this-skill-dir>/templates/generate-events-catalog.md` Phases 1–3 (detect → inventory → draft) against the surveyed codebase, then wire its cross-references using that template's Phase 4.1–4.2 append blocks. The template is the single source of truth for the catalog format, the enumeration rules (producer / consumer / self-consumed), the `_(unconfirmed)_` discipline for non-self consumer rows on the produced side, and the exact blocks to append to `docs/CONVENTIONS.md`, `AGENTS.md`, and `CLAUDE.md`. It's also a standalone artifact for non-Claude-Code agents, which is why it lives outside this file.

Three things are specific to running it inside an initialization:

- You're creating `docs/CONVENTIONS.md` in this same run, so append the template's "## Event catalog" block to it directly — the template's Phase 4.1 "stop and ask before creating CONVENTIONS.md" guard is for retrofitting an existing repo, not for a fresh scaffold.
- CLAUDE.md is written from [claude-md.md](../../templates/claude-md.md) in this same run, so its `docs/EVENTS.md` link is already there; skip the template's Phase 4.2 CLAUDE.md step.
- Don't run the template's Phase 4.4 (standalone commit) — `docs/EVENTS.md` is part of the single initial commit in Step 6.

## Monorepo layout

If the project has multiple services / apps / packages, scaffold a CONVENTIONS.md per scope, not just at the root:

```
<repo>/
├── docs/CONVENTIONS.md                          # repo-wide rules
├── infrastructure/docs/CONVENTIONS.md           # if there's an infra layer
└── <service-or-app>/docs/CONVENTIONS.md         # per service/app
```

Use each scope directory as the survey found it. The root file's "Where conventions live" table gets one row per scoped file, and the scoped files' headers say they override the root for their scope — both as [conventions.md](../../templates/conventions.md) sets out. Only the root file is imported.

## Rules

The behavior is specified in the steps above; these invariants are restated as a checklist because violating any one is the costly kind of mistake:

- **Explicit invocation only** — never auto-run based on project state.
- **Skip, don't overwrite** — existing files are sacred; only create what's in `TO_CREATE`, and report `TO_SKIP`.
- **No duplication** — information lives in one place, other docs link to it.
- **No empty scaffolds** — every section has real content or an explicit TODO.
- **Stack-aware** — tailor conventions and `.gitignore` to the detected stack.
- **Diagrams earn their place** — Mermaid only, and only for branching/ordering/non-obvious-relationship flows that are stable; prose, tables, and ASCII trees are the default. Topology in the diagram, constraints in prose beside it. See "Diagramming policy".
- **Living docs are non-negotiable** — the maintenance map goes into AGENTS.md verbatim, AND CONVENTIONS.md is created with the canonical-source-of-truth header verbatim, from their templates.
- **Import only the core** — CLAUDE.md imports `AGENTS.md`, `docs/CONVENTIONS.md` and `docs/PITFALLS.md`; every other living doc is a link, and each imported file stays under 200 lines.
- **Conventions live in `docs/CONVENTIONS.md`, never in private notes** — a new rule lands in the doc in the same PR; the doc is what survives session boundaries for every contributor, human or AI.
- **Per-scope CONVENTIONS.md for monorepos** — root + each service + infrastructure layer; cross-link so readers can navigate.
- **Local git only** — never push to a remote or create a GitHub repo unprompted.
