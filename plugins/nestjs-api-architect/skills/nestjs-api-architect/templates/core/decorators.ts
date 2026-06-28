// templates/core/decorators.ts
// The metadata decorators the guards/interceptors read. Keep them tiny and colocated so the
// auth/idempotency contract is one import away from the controller.
import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from "@nestjs/common";

// --- Guard opt-outs (see rules/auth-layered-guards.md) ------------------------------------------
export const SKIP_API_KEY = "skipApiKey";
/** Skip the perimeter ApiKeyGuard — for K8s probes, metrics scrape, anything outside the edge. */
export const SkipApiKey = (): MethodDecorator & ClassDecorator =>
  SetMetadata(SKIP_API_KEY, true);

export const PUBLIC_ROUTE = "publicRoute";
/** Skip the identity JwtAuthGuard — for register/login/JWKS-proxy/password-reset. API key still required. */
export const PublicRoute = (): MethodDecorator & ClassDecorator =>
  SetMetadata(PUBLIC_ROUTE, true);

// --- Idempotency (see rules/spot-idempotency-outbox.md) -----------------------------------------
export const IDEMPOTENT = "idempotent";
export interface IdempotentOptions {
  ttlSeconds: number;
}
/** Mark a mutating route idempotent — IdempotencyKeyInterceptor caches + replays the response. */
export const Idempotent = (options: IdempotentOptions): MethodDecorator =>
  SetMetadata(IDEMPOTENT, options);

// --- Current user --------------------------------------------------------------------------------
/**
 * Typed accessor over request.user — the DB row attached by the sync interceptor, NOT the raw JWT.
 * Type the parameter as your project-wide AuthenticatedUser.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
