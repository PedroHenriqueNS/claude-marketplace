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

// ponytail: minimal cache port; bind it to your Redis-backed implementation in the module.
export abstract class IdempotencyCache {
  abstract get(key: string): Promise<{ bodyHash: string; response: unknown } | null>;
  /** SET key value EX ttl NX — returns false if the key already existed. */
  abstract setIfAbsent(key: string, value: { bodyHash: string; response: unknown }, ttlSeconds: number): Promise<boolean>;
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

    const cacheKey = `idem:${req.user?.id ?? "anon"}:${key}`;
    const bodyHash = createHash("sha256").update(JSON.stringify(req.body ?? {})).digest("hex");

    const hit = await this.cache.get(cacheKey);
    if (hit) {
      if (hit.bodyHash !== bodyHash) {
        throw new ConflictException({ code: "IDEMPOTENCY.KEY_REUSED_WITH_DIFFERENT_BODY", message: "Idempotency key reused with a different payload." });
      }
      res.setHeader("X-Idempotent-Replay", "true");
      return of(hit.response);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cache.setIfAbsent(cacheKey, { bodyHash, response }, opts.ttlSeconds);
      }),
    );
  }
}
