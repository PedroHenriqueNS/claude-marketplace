# Mutating endpoints: idempotent + transactional outbox

> **DDD lens:** domain events are emitted *as part of the state change*, not as a fire-and-forget side
> effect. The outbox makes "state changed" and "event recorded" one atomic fact.

When the cluster runs on reclaimable infrastructure (AWS Spot, preemptible nodes), a pod can die with
~2 minutes' notice at any moment. Every mutating endpoint must be safe to retry and safe to interrupt:

1. **Idempotency.** Mark the controller method `@Idempotent({ ttlSeconds })`. A cross-replica cache
   replays the original response on a retry, so a client whose request died mid-flight can safely resend
   without double-creating / double-charging.
2. **Transactional outbox.** If the endpoint emits an async event, the outbox `INSERT` happens in the
   **same DB transaction** as the state change. Never publish (`XADD` / `publish`) directly from a use
   case — a pod dying between the commit and the publish would silently lose the event.
3. **Graceful drain.** A module holding a long-lived resource (DB pool, cache client, downstream HTTP
   client) implements `OnModuleDestroy` to drain on `SIGTERM`, so in-flight work finishes before exit.

```typescript
// WRONG — publishes outside the transaction; a crash here loses the event
await this.dataSource.transaction(async (m) => {
  await this.insertFollow.execute(InsertFollowInput.of({ followerId, followeeId, txEntityManager: m }));
});
await this.stream.xadd("events", "*", "envelope", JSON.stringify(event)); // ← lost if the pod dies first
```

```typescript
// RIGHT — outbox row commits atomically with the state change
await this.dataSource.transaction(async (m) => {
  await this.insertFollow.execute(InsertFollowInput.of({ followerId, followeeId, txEntityManager: m }));
  await this.insertOutboxEvent.execute(InsertOutboxEventInput.of({
    eventType: OutboxEventType.USER_FOLLOWED,
    aggregateType: OutboxAggregateType.USER,
    aggregateId: followeeId,
    payload: { followerId, followeeId },
    txEntityManager: m,
  }));
});
// a separate drainer worker publishes the row after commit — see events-redis-streams
```

The outbox row and the state change commit or roll back together; a drainer worker (see
`events-redis-streams`) publishes committed rows afterward. This is at-least-once delivery — consumers
dedup on the event id.

**Supersedes `arch-use-events` and `perf-async-hooks`** (generic nestjs-best-practices): events are
never emitted from a use case via an in-process emitter — they go through a same-TX outbox; and the
async-lifecycle hook (`OnModuleDestroy`) is mandatory for spot safety, not optional.
