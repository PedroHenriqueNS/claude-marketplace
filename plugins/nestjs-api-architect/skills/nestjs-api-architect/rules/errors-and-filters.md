# One exception filter; generic error messages

Throw `HttpException` subclasses or a project `BaseException` (with a `static of({ status, code, message,
cause? })` factory — `cause` is for logging/chaining, never the wire). One `CustomExceptionFilter`
(`@Catch()`) normalizes everything to a single envelope `{ status, code?, message }`. Controllers never
catch-and-return raw errors — the filter is the single exit for every failure, so the wire shape of an
error is identical across the whole API. The filter never echoes `cause` (or any HttpException body
detail beyond `code`) to the client — that text is attacker-influenceable and often leaks internals.

```typescript
// WRONG — controller hand-formats an error; shape drifts per route
async follow() {
  try { ... } catch (e) {
    return { ok: false, error: String(e) };  // ← raw, leaky, inconsistent
  }
}
```

```typescript
// RIGHT — throw a typed exception; the filter renders the envelope
async follow(@CurrentUser() user: AuthenticatedUser, @Param("targetId") targetId: string): Promise<void> {
  await this.followUser.execute(FollowUserInput.of({ viewerId: user.id, targetId }));
}
// somewhere in the use case:
throw BaseException.of({ status: HttpStatus.CONFLICT, code: "FOLLOWS.ALREADY_FOLLOWING", message: "..." });
```

## Error messages never name an internal service

The envelope `message:` returned to clients must be generic. Never name the IdP, the object store, the
database, the cache, the mailer, or any upstream service — it leaks architecture to anyone with HAR
access and ties the error contract to an implementation choice (swapping the IdP shouldn't force clients
to change hardcoded strings).

```typescript
// WRONG
throw new BadGatewayException({ code, message: "Keycloak is unavailable." });
// RIGHT
throw new BadGatewayException({ code, message: "Authentication provider is currently unavailable." });
```

Logs are exempt — log the upstream name freely for ops. Only the response envelope is scrubbed.

**Supersedes `error-use-exception-filters`** (generic nestjs-best-practices): beyond centralizing
handling, the envelope is normalized to a fixed shape *and* its messages are scrubbed of internal
service names.
