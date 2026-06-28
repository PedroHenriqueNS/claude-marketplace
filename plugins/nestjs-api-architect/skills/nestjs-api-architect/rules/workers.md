# Workers bootstrap a controller-less `WorkerModule`

> **DDD lens:** a worker is a separate process boundary that reacts to domain events — it shares the
> domain code but not the HTTP delivery layer.

Async workers (outbox drainer, event consumers, fan-out jobs) do not run inside the API process. They
bootstrap a dedicated `WorkerModule` that wires *only* what a worker needs — the DB, the cache, the
relevant use cases — and deliberately leaves out HTTP controllers and the HTTP-layer
interceptors/filters/guards. A single `main-worker.ts` is the entrypoint; a `WORKER_NAME` env var
selects which worker class to run, so the same image serves every worker as a separate Deployment off
the request path.

```typescript
// main-worker.ts — no HTTP server; resolve and run the named worker
async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  app.enableShutdownHooks();
  const name = app.get(EnvService).get("WORKER_NAME");
  await app.get(WORKER_REGISTRY)[name].run();
}
```

```yaml
# the same image, a different command — one Deployment per worker
command: ["node", "dist/main-worker.js"]
env:
  - { name: WORKER_NAME, value: "outbox-drainer" }
```

Each worker implements `OnModuleDestroy` to drain in-flight work on `SIGTERM` (see
`spot-idempotency-outbox`) — on reclaimable infra it can be evicted mid-loop, so it must ack/commit
only after a unit of work fully succeeds and stop cleanly when asked. Keeping workers out of the API
process means a busy drain loop never competes with request latency, and a crashing worker never takes
the API down.
