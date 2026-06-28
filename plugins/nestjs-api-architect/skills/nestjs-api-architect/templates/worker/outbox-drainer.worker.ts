// OutboxDrainerWorker — publishes domain events the safe way. Use cases NEVER publish to the stream
// directly; they INSERT an outbox row in the SAME transaction as the state change (see
// insert-outbox-event.repository.ts). This worker drains those rows to the stream AFTER commit, so no
// event is lost if a pod dies between the DB write and the publish.
//
// FOR UPDATE SKIP LOCKED lets multiple replicas run safely. Delivery is at-least-once — consumers
// MUST dedup on eventId. The loop stops cleanly on SIGTERM via OnModuleDestroy.
import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { DataSource } from "typeorm";
import type { Redis } from "ioredis";
import { REDIS_CLIENT } from "@/@core/redis/redis.module";

const STREAM = "<app>.events";
const BATCH = Number(process.env.OUTBOX_BATCH_SIZE ?? 100);
const POLL_MS = Number(process.env.OUTBOX_POLL_INTERVAL_MS ?? 1000);
const MAX_ATTEMPTS = Number(process.env.OUTBOX_MAX_ATTEMPTS ?? 5);

@Injectable()
export class OutboxDrainerWorker implements OnModuleInit, OnModuleDestroy {
  private running = false;
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  onModuleInit(): void {
    this.running = true;
    void this.tick();
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  private async tick(): Promise<void> {
    if (!this.running) {
      return;
    }
    try {
      await this.drainBatch();
    } catch {
      // Swallow transient errors and retry next tick — never crash the loop.
    }
    if (this.running) {
      this.timer = setTimeout(() => void this.tick(), POLL_MS);
    }
  }

  private async drainBatch(): Promise<void> {
    await this.dataSource.transaction(async (m) => {
      const rows: Array<Record<string, unknown>> = await m.query(
        `SELECT id, event_type, aggregate_type, aggregate_id, payload, created_at, attempts
           FROM outbox
          WHERE published_at IS NULL AND dead_lettered_at IS NULL
          ORDER BY created_at
          FOR UPDATE SKIP LOCKED
          LIMIT $1`,
        [BATCH],
      );

      for (const row of rows) {
        try {
          const envelope = JSON.stringify({
            eventId: row.id,
            eventType: row.event_type,
            aggregateType: row.aggregate_type,
            aggregateId: row.aggregate_id,
            occurredAt: row.created_at,
            // additive-only — never remove/rename a field in `data`; mint a new event type for a breaking change.
            data: row.payload,
          });
          await this.redis.xadd(STREAM, "*", "envelope", envelope);
          await m.query(`UPDATE outbox SET published_at = now() WHERE id = $1`, [row.id]);
        } catch {
          const attempts = Number(row.attempts) + 1;
          await m.query(
            `UPDATE outbox
                SET attempts = $2,
                    dead_lettered_at = CASE WHEN $2 >= $3 THEN now() ELSE dead_lettered_at END
              WHERE id = $1`,
            [row.id, attempts, MAX_ATTEMPTS],
          );
        }
      }
    });
  }
}
