# Async events: outbox → stream, unversioned + additive-only envelopes

A drainer worker is the only thing that turns committed outbox rows into published events. Each tick it
claims a batch of unpublished rows with `FOR UPDATE SKIP LOCKED` (so multiple replicas never grab the
same row), publishes each to a single project-wide stream, and marks it published — or increments an
attempt counter and dead-letters after a max. Consumers read via consumer groups and **dedup on the
event id**, because delivery is at-least-once (a crash between publish and the `published_at` write
re-publishes the row).

```text
use case ──INSERT outbox row (same TX as state change)──► outbox table
                                                            │
OutboxDrainerWorker: SELECT … WHERE published_at IS NULL    │
  FOR UPDATE SKIP LOCKED LIMIT N  ──XADD──► "app.events" stream ──► consumer groups
  then UPDATE published_at = now()
```

## Envelope shape: unversioned, additive-only

```json
{
  "eventId": "<outbox row uuid>",
  "eventType": "UserFollowed",
  "aggregateType": "user",
  "aggregateId": "<uuid>",
  "occurredAt": "<iso timestamp>",
  "data": { "followerId": "...", "followeeId": "..." }
}
```

There is **no `eventVersion`**. Payloads are additive-only — never remove or rename a field inside
`data`; old consumers ignore unknown fields. A true breaking change mints a *new* event type
(`UserFollowedV2`), it never reshapes an existing one. That keeps every historical consumer working
without a coordinated migration.

The broker here is Redis Streams (the project rules out Kafka and RabbitMQ), but the pattern is what
matters: the outbox is the durable boundary, the stream is the transport, and the envelope contract is
forward-compatible by construction. The outbox table is the *producer's* write-ahead log — only the
drainer reads it; consumers read the stream, never the table.

**Supersedes `micro-use-queues`** (generic nestjs-best-practices): the queue is fed by a transactional
outbox (not direct enqueues), and envelopes are versionless + additive-only rather than schema-versioned.
