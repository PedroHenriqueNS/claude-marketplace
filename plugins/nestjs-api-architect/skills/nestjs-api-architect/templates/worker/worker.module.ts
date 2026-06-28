// WorkerModule — the bootstrap module for async workers. Wires ONLY what workers need: config, the
// database, the cache/stream client, and the worker classes. NO controllers, NO HTTP guards /
// filters / interceptors — workers run off the request path. main-worker.ts loads this module and
// WORKER_NAME selects which worker actually runs.
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@/@core/config/config.module";
import { DatabaseModule } from "@/@core/db/database.module";
import { RedisModule } from "@/@core/redis/redis.module";
import { OutboxEventEntity } from "@/@core/entities/outbox-event.entity";
import { OutboxDrainerWorker } from "./outbox-drainer.worker";

@Module({
  imports: [ConfigModule, DatabaseModule, RedisModule, TypeOrmModule.forFeature([OutboxEventEntity])],
  providers: [OutboxDrainerWorker],
})
export class WorkerModule {}
