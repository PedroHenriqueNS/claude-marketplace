// IdempotencyKeyInterceptor — makes mutating endpoints safe to retry (required when pods can die
// mid-request). On routes marked @Idempotent({ ttlSeconds }), it caches (userId, key) -> response
// and replays the cached response on a retry instead of running the handler twice.
//
// Wire it as a global APP_INTERCEPTOR. The cache is any atomic SET-NX-EX store (e.g. Redis).
import {
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request, Response } from "express";
import { createHash } from "crypto";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { IDEMPOTENT, IdempotentOptions } from "../decorators/idempotent.decorator";

const HEADER = "x-<app>-idempotency-key";

// A request that has reserved a key is "pending" until its handler resolves, then "done".
type IdempotencyRecord =
  | { state: "pending"; bodyHash: string }
  | { state: "done"; bodyHash: string; response: unknown };

// ponytail: minimal cache port; bind it to your Redis-backed implementation in the module.
export abstract class IdempotencyCache {
  abstract get(key: string): Promise<IdempotencyRecord | null>;
  /** SET key value EX ttl NX — atomic reserve; returns false if the key already existed. */
  abstract setIfAbsent(key: string, value: IdempotencyRecord, ttlSeconds: number): Promise<boolean>;
  /** Overwrite a reservation with the final result once the handler succeeds. */
  abstract set(key: string, value: IdempotencyRecord, ttlSeconds: number): Promise<void>;
  /** Release a reservation (handler threw) so the caller can retry. */
  abstract delete(key: string): Promise<void>;
}

@Injectable()
export class IdempotencyKeyInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: IdempotencyCache,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const opts = this.reflector.getAllAndOverride<IdempotentOptions>(IDEMPOTENT, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!opts) return next.handle();

    const req = context.switchToHttp().getRequest<Request & { user?: { id: string } }>();
    const res = context.switchToHttp().getResponse<Response>();
    const key = req.header(HEADER);
    if (!key) return next.handle(); // no key supplied — nothing to dedupe

    // No authenticated principal → no per-tenant namespace. Sharing one "anon" bucket would let one
    // caller replay another caller's response, so unauthenticated callers simply don't get idempotency.
    const principalId = req.user?.id;
    if (!principalId) return next.handle();

    const cacheKey = `idem:${principalId}:${key}`;
    const bodyHash = createHash("sha256").update(JSON.stringify(req.body ?? {})).digest("hex");

    // Reserve the key ATOMICALLY before running the handler. If two identical requests race, exactly
    // one wins the reservation and runs; the loser sees the reservation and never double-executes.
    const reserved = await this.cache.setIfAbsent(cacheKey, { state: "pending", bodyHash }, opts.ttlSeconds);
    if (!reserved) {
      const hit = await this.cache.get(cacheKey);
      if (!hit) return next.handle(); // ponytail: reservation expired in the gap (TTL); rare, treat as fresh
      if (hit.bodyHash !== bodyHash) {
        throw new ConflictException({ code: "IDEMPOTENCY.KEY_REUSED_WITH_DIFFERENT_BODY", message: "Idempotency key reused with a different payload." });
      }
      if (hit.state === "pending") {
        throw new ConflictException({ code: "IDEMPOTENCY.IN_FLIGHT", message: "A request with this idempotency key is still being processed. Retry shortly." });
      }
      res.setHeader("X-Idempotent-Replay", "true");
      return of(hit.response);
    }

    // We hold the reservation: run the handler, then commit its result (or release it on failure).
    // ponytail: cache writes are fire-and-forget; a crash mid-write leaves the key "pending" until
    // TTL, which fails safe — retries get IN_FLIGHT, never a double-execute.
    return next.handle().pipe(
      tap({
        next: (response) => {
          void this.cache.set(cacheKey, { state: "done", bodyHash, response }, opts.ttlSeconds);
        },
        error: () => {
          void this.cache.delete(cacheKey);
        },
      }),
    );
  }
}
