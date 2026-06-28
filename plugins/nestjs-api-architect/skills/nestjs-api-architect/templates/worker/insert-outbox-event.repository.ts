// InsertOutboxEventRepository — what a use case calls INSIDE its transaction to emit a domain event.
// The outbox row and the state change commit (or roll back) together, so the event can't be lost to a
// crash between the DB write and the publish. The OutboxDrainerWorker publishes it later — the use
// case never touches the stream.
//
// Its input/output follow the shared-op/repository templates: InsertOutboxEventInput extends
// BaseClass with an optional `txEntityManager` (and NO @ApiProperty — it's never on the wire);
// InsertOutboxEventOutput is id-only and not validated at runtime.
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OutboxEventEntity } from "@/@core/entities/outbox-event.entity";
import { InsertOutboxEventInput } from "./input";
import { InsertOutboxEventOutput } from "./output";

@Injectable()
export class InsertOutboxEventRepository {
  constructor(
    @InjectRepository(OutboxEventEntity)
    private readonly repo: Repository<OutboxEventEntity>,
  ) {}

  async execute(input: InsertOutboxEventInput): Promise<InsertOutboxEventOutput> {
    // Enlist in the caller's transaction when present, so the event and the state change are atomic.
    const manager = input.txEntityManager ?? this.repo.manager;
    const row = manager.create(OutboxEventEntity, {
      eventType: input.eventType,
      aggregateType: input.aggregateType,
      aggregateId: input.aggregateId,
      payload: input.payload,
    });
    const saved = await manager.save(row);
    return InsertOutboxEventOutput.of({ id: saved.id });
  }
}
