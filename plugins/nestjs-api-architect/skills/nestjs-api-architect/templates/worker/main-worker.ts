// main-worker.ts — the worker entrypoint, separate from the HTTP app's main.ts. Deployed as its own
// process (`node dist/main-worker.js`) with WORKER_NAME selecting which worker class runs. It boots a
// controller-less context (no HTTP server) and drains in-flight work on SIGTERM — essential on spot
// infra, where a pod gets only a ~2-minute termination warning.
import { INestApplicationContext, Type } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { WorkerModule } from "./worker.module";
import { OutboxDrainerWorker } from "./outbox-drainer.worker";

// Map WORKER_NAME → the provider to resolve. Add one entry per worker class.
const WORKERS: Record<string, Type<unknown>> = {
  "outbox-drainer": OutboxDrainerWorker,
};

async function bootstrap(): Promise<void> {
  const workerName = process.env.WORKER_NAME ?? "";
  const workerToken = WORKERS[workerName];
  if (!workerToken) {
    throw new Error(`Unknown WORKER_NAME "${workerName}". Known: ${Object.keys(WORKERS).join(", ")}`);
  }

  // No HTTP server — createApplicationContext, not create().
  const app: INestApplicationContext = await NestFactory.createApplicationContext(WorkerModule, {
    bufferLogs: true,
  });
  app.enableShutdownHooks(); // OnModuleDestroy fires on SIGTERM/SIGINT so the worker's loop drains.

  // Resolving the worker is enough — its onModuleInit starts the loop. The context keeps the process alive.
  app.get(workerToken);

  const shutdown = async (): Promise<void> => {
    await app.close(); // triggers OnModuleDestroy across the context → loops stop, resources drain
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown());
  process.on("SIGINT", () => void shutdown());
}

void bootstrap();
