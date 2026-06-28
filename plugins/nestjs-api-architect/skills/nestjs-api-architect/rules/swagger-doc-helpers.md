# Every route's Swagger lives in one `Api<Route>Doc()` helper

> **DDD lens:** the doc helper is the published contract of a bounded context's endpoint — keep it in
> one readable place, separate from runtime behavior.

A controller method's Swagger documentation lives in **one** helper: an `Api<Route>Doc()` composed with
`applyDecorators(...)`. That helper bundles every **Swagger-only** decorator — `@ApiTags`,
`@ApiOperation`, `@ApiBody`, `@ApiQuery`, `@ApiParam`, `@ApiProduces`, `@ApiOkResponse` /
`@ApiNoContentResponse` / `@Api<Error>Response`, and so on. The helper name is PascalCase matching the
controller method (`ApiFollowUserDoc` for `follow()`).

**Swagger only — no NestJS runtime decorators inside the helper.** `@HttpCode`, `@Header`, `@UseGuards`,
`@SkipApiKey`, `@PublicRoute`, Terminus's `@HealthCheck()` — anything that changes runtime behavior —
stays on the controller method. A `@UseGuards()` hidden inside `ApiFollowUserDoc()` reads like
documentation but silently changes auth; burying it makes the security and status contract invisible at
the call site, where the reviewer is actually looking.

```typescript
// WRONG — Swagger noise stacked on the method
@Post(":targetId")
@UseGuards(ApiKeyGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiTags("follows")
@ApiOperation({ summary: "Follow a user" })
@ApiParam({ name: "targetId" })
@ApiNoContentResponse({ description: "Followed" })
@ApiBadRequestResponse({ description: "Cannot follow self" })
async follow() { /* ... */ }

// WRONG — runtime decorators hidden inside the doc helper
export const ApiFollowUserDoc = (): MethodDecorator =>
  applyDecorators(
    UseGuards(ApiKeyGuard),           // ← runtime; does not belong
    HttpCode(HttpStatus.NO_CONTENT),  // ← runtime; does not belong
    ApiTags("follows"),
  );

// RIGHT — runtime decorators visible on the method; Swagger-only inside the helper
@Post(":targetId")
@UseGuards(ApiKeyGuard)
@HttpCode(HttpStatus.NO_CONTENT)
@ApiFollowUserDoc()
async follow(
  @CurrentUser() user: AuthenticatedUser,
  @Param("targetId") targetId: string,
): Promise<void> {
  await this.followUser.execute(FollowUserInput.of({ viewerId: user.id, targetId }));
}
```

**File layout.** Feature routes: `modules/<feature>/application/dtos/<route-name>.dto.ts`. Cross-cutting
helpers reused across modules: `shared/api-docs/dtos/<route-name>.dto.ts`. The folder is `dtos/` and the
file is `.dto.ts` because that same file also holds any response-shape DTO classes the route advertises.

```typescript
// modules/follows/application/dtos/follow-user.dto.ts
export const ApiFollowUserDoc = (): MethodDecorator =>
  applyDecorators(
    ApiTags("follows"),
    ApiOperation({ summary: "Follow a user (or request to follow a private one)" }),
    ApiParam({ name: "targetId", description: "Id of the user to follow" }),
    ApiNoContentResponse({ description: "Followed, or follow request created" }),
    ApiBadRequestResponse({ description: "Cannot follow yourself" }),
    ApiNotFoundResponse({ description: "User not found" }),
  );
```

**Typed shorthand decorators** (`ApiOkResponse`, `ApiNoContentResponse`, `ApiForbiddenResponse`, ...)
infer their status from the decorator name — don't pass `status:` to them. Reserve the generic
`ApiResponse({ status: HttpStatus.X, ... })` for non-standard codes the typed helpers don't cover (see
`http-status-enum`).

Why bundle: stacked decorators duplicate across controllers and drift (one route quotes `400`, another
`HttpStatus.BAD_REQUEST`) until reviewers stop reading them. The helper co-locates one route's whole wire
contract in a file you can read top to bottom, forces a consistent ordering (tag → operation → body →
params → responses), keeps the controller method body a true one-liner, and makes a contract change a
single-file edit.
