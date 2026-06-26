# Prompt: Generate the cross-service event catalog (`docs/EVENTS.md`)

> **Audience.** Claude Code, Cursor, Aider, or any agentic AI coding tool running in a
> repository **that publishes and/or consumes events on Kafka or RabbitMQ**.
>
> **Purpose.** Produce `docs/EVENTS.md`, a living catalog of every event the service
> **publishes** (mapped to the consumer queues that subscribe to it across the broader
> service graph) **and every event the service consumes** (mapped to the producing
> service's exchange/topic). The catalog plus a one-line rule in `docs/CONVENTIONS.md`
> makes both sides of the fan-out topology visible to humans and AI agents, instead
> of being implicit in the code of N different repos.

---

## Contents

- [When to skip this prompt entirely](#when-to-skip-this-prompt-entirely)
- [How to use this prompt](#how-to-use-this-prompt)
- [Phase 1 — Detect](#phase-1--detect) — brokers, producer/consumer surfaces, API name, proceed/stop
- [Phase 2 — Inventory](#phase-2--inventory) — enumerate produced & consumed keys, what not to guess
- [Phase 3 — Draft `docs/EVENTS.md`](#phase-3--draft-docseventsmd) — path, skeleton, fill-in
- [Phase 4 — Wire up](#phase-4--wire-up) — CONVENTIONS rule, link docs, verify, commit
- [What this prompt deliberately does NOT do](#what-this-prompt-deliberately-does-not-do)
- [Quality bar](#quality-bar)

---

## When to skip this prompt entirely

Run the following grep. If none of these terms appear, **stop** — there are no events
to catalog and this prompt does not apply:

```bash
grep -rEl "kafkajs|@nestjs/microservices.*Kafka|node-rdkafka|@golevelup/nestjs-rabbitmq|amqplib|amqp-connection-manager|aio_pika|kombu|confluent-kafka" \
  . --include="package.json" --include="pyproject.toml" --include="requirements*.txt" --include="go.mod" --include="Cargo.toml" 2>/dev/null
```

A pure-consumer service still produces a useful catalog: the "Events consumed"
section documents which upstream exchanges/topics it binds to. Bail only if the
service neither publishes nor consumes any broker traffic.

## How to use this prompt

Paste this whole file into a session opened at the **target repository's root**. The
agent must follow the four phases below in order. **Do not skip steps** — each one feeds
the next.

```
Phase 1 — Detect      (read-only, confirm broker + producer code exists)
Phase 2 — Inventory   (enumerate produced routing keys / topics)
Phase 3 — Draft       (write docs/EVENTS.md from the inventory)
Phase 4 — Wire up     (rule in docs/CONVENTIONS.md, links from other docs, commit)
```

If at any point the inventory turns up zero produced events, stop and report — don't
write an empty catalog.

---

## Phase 1 — Detect

Confirm the broker(s) in use and locate the publisher code. Output a one-paragraph
"Detection result" before moving on.

### 1.1 Identify the broker(s)

Run the grep from "When to skip" above. Classify each match:

| Library / dep | Broker |
|---|---|
| `kafkajs`, `node-rdkafka`, `confluent-kafka`, `@nestjs/microservices` (Kafka transport) | Kafka |
| `@golevelup/nestjs-rabbitmq`, `amqplib`, `amqp-connection-manager`, `aio_pika`, `kombu` | RabbitMQ |

If both appear, the catalog covers both — one section per broker.

### 1.2 Find the publisher(s) and consumer(s)

Grep for the canonical publish surface:

- **RabbitMQ:** `amqp.publish(`, `channel.publish(`, `AmqpConnection`, classes named
  `*Publisher` / `*Notifier` / `*Producer`. Trace to a single file/class that owns
  every outbound publish.
- **Kafka:** `producer.send(`, `kafka.send(`, `@nestjs/microservices` `ClientKafka.emit(`,
  classes named `*Producer` / `*Notifier`.

Confirm there's at most one producer façade per broker. If multiple producers exist
across different modules, list them all — the catalog needs to enumerate every produced
topic/routing-key regardless of which class emits it.

Grep for the canonical consume surface:

- **RabbitMQ:** `@RabbitSubscribe`, `@ApiRabbitMessage`, `consumer.subscribe(`,
  `channel.consume(`, classes named `*Listener` / `*Consumer` / `*Subscriber`. The
  binding is usually declared via `RabbitQueue` enum + topology config (e.g.
  `rabbit.options.ts`).
- **Kafka:** `@MessagePattern`, `consumer.subscribe(`, `kafka.subscribe(`,
  classes named `*Listener` / `*Consumer`.

Identify every queue (RabbitMQ) or `@MessagePattern` topic (Kafka) the service binds
to, including the **source exchange/topic** (which other service owns it).

### 1.3 Identify the API name

This name will appear in the catalog header and (for RabbitMQ) in the exchange name.
Pull from:

- `package.json` `name` field, stripped of any `*-api-*` infix that's a Kafka topic
  prefix convention (e.g. `dry-api-pedido` → `dry-pedido` for RabbitMQ).
- `pyproject.toml` `[project] name` / Python package directory.
- `go.mod` module path final segment.

Record the API name; you'll use it throughout the catalog.

### 1.4 Decision: proceed or stop

Stop if:
- No publishes AND no consumes detected (service does not touch the broker at all).
- All producer/consumer code is scaffolded but inactive (files exist, no `.publish(`
  or `@RabbitSubscribe` / `@MessagePattern` calls).

If only publishes OR only consumes are detected, proceed — the catalog will have one
side populated and the other side noted as empty.

Otherwise: write a one-paragraph detection result and continue to Phase 2.

---

## Phase 2 — Inventory

Build two tables: **everything this service publishes**, and **everything this service
consumes**. One row per topic / routing-key on each side.

### 2.1 Enumerate produced routing keys / topics

For each broker:

- **RabbitMQ:** locate the constants file holding routing-key enum (typical names:
  `RabbitRoutingKey`, `RoutingKey`, `EventName`, `Topics`). Grep the publisher class for
  every distinct routing-key it passes.
- **Kafka:** locate the topic-name enum (`Topic`, `KafkaTopic`, `Topics`). Grep the
  producer for every distinct topic it sends to.

If routing keys / topics are inline string literals (no enum), grep for the publish
call sites directly and dedup the literals. **Flag this as a fragility** — recommend
extracting to an enum in a future PR.

### 2.2 For each produced routing key / topic, capture

- **Name** (the literal string).
- **Emit method** (file path + line number of the publisher method that calls
  `.publish(rk, ...)` with this key — link via `file:line`).
- **When emitted** (the business condition: "every new order is persisted",
  "payment confirmation event arrives", etc.). Read the method body, summarize in
  one sentence.
- **Payload shape** (the TypeScript / Pydantic / Go struct name and where it lives).
- **Destination exchange/topic** (which exchange the publish lands on — usually this
  service's own, but cross-API publishes go on another service's exchange).
- **Self-consumed?** Grep for `@RabbitSubscribe` / `@MessagePattern` /
  `consumer.subscribe(` in **this** repo that binds to the same routing-key or topic.
  If yes, record the consumer queue name and handler `file:line`.

### 2.3 Enumerate consumed routing keys / topics

For each broker:

- **RabbitMQ:** locate the queue-name enum (typical names: `RabbitQueue`, `Queues`)
  and the topology config (e.g. `rabbit.options.ts`) declaring queue→exchange
  bindings. Each declared queue is a consumed stream.
- **Kafka:** grep for `@MessagePattern(<topic>)` / `consumer.subscribe([<topic>])`.
  Each distinct topic the service binds to is a consumed stream.

### 2.4 For each consumed routing key / topic, capture

- **Routing key / topic name** (the literal string the consumer binds to).
- **Source exchange/topic owner** — which service publishes this event (infer from
  the exchange/topic name prefix or known service graph).
- **Queue name** (RabbitMQ) or **consumer group** (Kafka) — what this service
  registers to receive the events.
- **Handler** (file path + line number of the `@RabbitSubscribe` / `@MessagePattern`
  method — link via `file:line`).
- **Purpose** (one-sentence summary of what this service does with the event:
  "marks pedido as paid", "triggers logistics dispatch", etc.).
- **Retry/DLQ posture** (briefly: which DLX, retry queue, max retries — only if the
  service has an explicit retry topology; otherwise skip).

### 2.5 What NOT to guess

You can verify "produced by this service" and "self-consumed by this service" from
the code in front of you. You **cannot** verify what other services subscribe to
without opening their repos. **Do not invent consumer rows for the produced side.**
For every produced routing key, write each non-self consumer row with
`_(unconfirmed — verify in <service-name>)_` and let the human or a follow-up PR
fill it in.

On the consumed side, you CAN verify (it's your own code), so consumed-event rows
should not carry `_(unconfirmed)_` — they're authoritative.

---

## Phase 3 — Draft `docs/EVENTS.md`

### 3.1 Path

Write to `docs/EVENTS.md`. If `docs/` doesn't exist, create it. If a different
documentation root convention is used in this repo (e.g. `documentation/`,
`.docs/`), follow that convention and adjust the file path accordingly.

### 3.2 Skeleton (adapt to the broker)

```markdown
# EVENTS — <Service Name>

Catalog of every event this service **publishes** (mapped to the consumer queues
across services that subscribe to it) **and every event this service consumes**
(mapped to the producing service's exchange/topic).

> **Source-of-truth note.** The runtime broker is the ground truth — at any moment,
> the broker management API returns the *actual* bindings. This document is the
> **intended** topology; consumer services should keep their rows here in sync via PR
> whenever they add or remove a subscription. See
> [CONVENTIONS.md § Event catalog](CONVENTIONS.md#event-catalog).

## Fan-out semantics (quick refresher)

[For RabbitMQ topic exchanges: explain that one publish fans out to every bound queue,
 each with its own ack/retry/DLQ lifecycle.]
[For Kafka topics: explain that one topic is read by N consumer groups, each tracking
 its own offset over the same log.]

## Exchange / Topic

[For RabbitMQ:]
| Exchange | Type | Owner | Purpose |
|---|---|---|---|
| `<api>.events` | `topic` (durable) | this service | self-owned events |

[For Kafka:]
| Topic prefix | Owner | Notes |
|---|---|---|
| `<api>.*` | this service | partition count, retention — fill in from broker config |

## Events published

### `<routing-key-or-topic>`

- **Emitted by:** [<Class.method>](<file:line>)
- **When:** <one-sentence business condition>
- **Payload shape:** `<TypeName>` (see [<file>](<file>))
- **Notes:** <any caveats, e.g. "still on legacy Kafka pending consumer migration">

| Consumer service | Consumer queue / group | Purpose |
|---|---|---|
| <this-service>    | <queue-name OR — (not self-consumed)> | <purpose> |
| <other-service-1> | _(unconfirmed — verify in <other-service-1>)_ | _likely: <best guess from name>_ |
| <other-service-N> | _(unconfirmed — verify in <other-service-N>)_ | _likely: <…>_ |

[Repeat per routing-key / topic.]

## Events consumed

### `<routing-key-or-topic>`

- **Produced by:** `<other-service-name>` on exchange/topic `<exchange-or-topic-name>`.
- **Bound queue / consumer group:** `<queue-name-or-group>`.
- **Handler:** [<Class.method>](<file:line>)
- **Purpose:** <one-sentence summary of what this service does with the event>
- **Retry / DLQ:** <e.g. "5 retries, 5s TTL, then <queue>.dlq" — only if relevant>

[Repeat per consumed routing-key / topic.]

## How to keep this file accurate

1. **When a downstream service adds a new subscription** against this service's
   exchange/topic — that service's PR should add a row under the matching event's
   table here.
2. **When a downstream service removes a binding** — same PR pattern in reverse:
   clear the row or mark it removed-on-`<date>`.
3. **When this service adds, removes, or renames a published routing key / topic** —
   update both the section heading and the producer-code link in the same PR.
4. **To verify the live broker matches this doc:** query the management API
   (RabbitMQ: `GET /api/exchanges/<vhost>/<exchange>/bindings/source`;
    Kafka: `kafka-consumer-groups.sh --describe --all-groups`).

## Out of scope

- **Internal-only / in-process events** that never hit the broker.
- **Downstream-of-downstream fan-out** — when this service consumes event A and reacts
  by publishing event B, only A and B are listed here; the chain stops at this
  service's boundary.
```

### 3.3 Fill in the skeleton from Phase 2 inventory

**Produced side** — one section per produced routing key. The `Consumer service`
column has at least:

1. **This service**, with either the self-consumed queue name (verified in Phase 2.2)
   or `— (not self-consumed)`.
2. **Best-guess downstream services** named from the routing-key semantics, each
   marked `_(unconfirmed — verify in <service-name>)_`. Examples:
   - `payment.*` → likely consumed by `<billing-service>` and/or `<notification-service>`
   - `user.created` → likely consumed by `<onboarding-service>`, `<analytics-service>`,
     `<notification-service>`
   Use the actual service names from the codebase's outbound HTTP clients,
   `docker-compose.yml`, monorepo siblings, or naming-convention prefixes — don't
   invent service names.

The `_(unconfirmed)_` marker is load-bearing: it signals to readers that the row is
a hypothesis, not a verified fact, and signals to other services' PRs that they're
expected to confirm or remove it.

**Consumed side** — one section per consumed routing key, populated from
Phase 2.4. These rows are authoritative (your own code) — no `_(unconfirmed)_`
marker. If the producing service is uncertain (e.g. the exchange name is generic),
note that explicitly rather than guessing.

---

## Phase 4 — Wire up

### 4.1 Add the maintenance rule to `docs/CONVENTIONS.md`

Append a section (preserving any existing structure):

```markdown
## Event catalog

[docs/EVENTS.md](EVENTS.md) is the cross-service catalog of every <routing-key|topic>
this service **publishes** (plus the known consumer queues per service) and every
<routing-key|topic> this service **consumes** (plus the producing service). <Broker>
fans a published message out to every bound queue/consumer group, so the same event
can be consumed by multiple services in parallel.

- **When adding a new consumer against this service's events** (in any service's
  repo), add a row to the matching event's table in `docs/EVENTS.md` in the same PR.
- **When adding, removing, or renaming a published <routing-key|topic>** in this
  service, update the produced-side section heading AND the producer call-site link
  in `docs/EVENTS.md` in the same PR.
- **When adding, removing, or renaming a consumed <routing-key|topic>** in this
  service (new `@RabbitSubscribe` / `@MessagePattern`, queue rename, etc.), update
  the consumed-side section in `docs/EVENTS.md` in the same PR.
- The runtime broker is the ground truth at any moment; `docs/EVENTS.md` is the
  *intended* topology. Diff the two when something looks off.
```

If `docs/CONVENTIONS.md` doesn't exist, **stop and ask** the human whether to scaffold
the full conventions doc or just to drop the rule into AGENTS.md / README.md. Don't
silently create a conventions file from scratch.

### 4.2 Link from existing docs

- `docs/ARCHITECTURE.md` (if present) — under the messaging / events section, add a
  one-line pointer: `For the per-event catalog, see [EVENTS.md](EVENTS.md).`
- `AGENTS.md` "Documentation maintenance" section — add this bullet:
  `- New subscription against this service's events, OR new/renamed published <routing-key|topic>, OR new/renamed consumed <routing-key|topic> (this service binding to upstream events) → update docs/EVENTS.md`
- `CLAUDE.md` "Living documentation" list (if present) — add `- @docs/EVENTS.md` in alphabetical position.

### 4.3 Verify

Run the project's lint / link-check / build. If `docs/EVENTS.md` references files
that don't exist (typos in producer paths), fix before committing.

### 4.4 Commit

One commit, conventional-commits prefix (`docs:` or whatever the project uses):

```
docs : add cross-service event catalog (docs/EVENTS.md)

<one paragraph summarizing the catalog and why it exists>

<list of files touched>
```

Mention any `_(unconfirmed)_` rows in the body so reviewers know to chase them.

---

## What this prompt deliberately does NOT do

- It does not modify producer or consumer code.
- It does not invent consumer rows — every non-self consumer is marked unconfirmed.
- It does not create services' equivalents of this catalog in other repos — each
  service maintains its own outbound catalog.
- It does not enforce a single broker — Kafka and RabbitMQ can coexist; the catalog
  has one section per broker if both are present.
- It does not block on the broker being reachable — the catalog is generated from
  source code, not from runtime binding queries.

## Quality bar

Before declaring done, the agent should be able to answer "yes" to all:

1. Every routing key / topic this service's producer emits has its own section under
   "Events published".
2. Every produced section names the emit method with a clickable `file:line` link.
3. Every produced section's consumer table has at least one row (this service, even
   if "not self-consumed").
4. Every non-self consumer row on the produced side is marked `_(unconfirmed)_`.
5. Every routing key / topic this service binds to as a consumer has its own section
   under "Events consumed", with the producing service identified and the handler
   linked via `file:line`. Consumed sections do NOT carry `_(unconfirmed)_` — they're
   authoritative.
6. The maintenance rule (covering BOTH publish-side and consume-side updates) exists
   in `docs/CONVENTIONS.md` (or an equivalent acknowledged substitute).
7. `git status` shows only the expected file additions/edits — no incidental drift.
