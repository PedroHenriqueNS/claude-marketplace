# Route prefixes match the owning module

> **DDD lens:** a route's prefix names the bounded context that owns the *action*, not the resource the
> action happens to touch.

Every controller carries a class-level `@Controller("v1/<owning-module>")` prefix, and a controller
**must not** define routes under another module's prefix. If a use case lives in module X, its
HTTP-facing route lives in module X under `v1/<X>/...`. When an action conceptually involves another
module's resource (e.g. "follow user Y" feels like `v1/users/:id/follow`), the route still lives under
the *action's* owning module; the path segments after the prefix describe the related resource.

```typescript
// WRONG — block lives in BlocksModule, but the route is served under v1/users (UsersModule's prefix)
@Controller("v1/users")
export class UsersController {
  constructor(private readonly blockUser: BlockUserService) {}
  @Post(":id/block") async block() { /* ... */ }
}

// RIGHT — block routes belong under v1/blocks, in a controller owned by BlocksModule
@Controller("v1/blocks")
export class BlocksController {
  constructor(private readonly blockUser: BlockUserService) {}
  @Post(":targetId") async block() { /* ... */ }
}
```

Why: the prefix is the index into the codebase. With this rule, the prefix tells you the module, the
module tells you the directory, the directory tells you the service — an unbroken "where is the
controller for X?" chain. Without it, a module's routes scatter across unrelated prefixes, the OpenAPI
doc groups endpoints under the wrong tag, and that chain breaks.

## Path-segment naming

`<METHOD> /v1/<owning-module>/<sub-path>`:

- **Bare `:id`** when the id is the controller's own primary resource — `POST v1/follows/requests/:id/accept` (the follow-request id).
- **Descriptive `:targetId` / `:userId` / `:requestId`** when the id refers to a resource *outside* the controller's domain — `POST v1/follows/:targetId` (a user id, not a follow id).
- **`/me`** for "the authenticated user as subject" — `GET v1/blocks/me`, `GET v1/follows/me/pending`.
- **Nested-resource listings** use `/<related-plural>/:relatedId/<list-name>` — `GET v1/follows/users/:userId/followers`.
- **HTTP verb + plain plural** is the default; add a sub-path only when the verb alone is ambiguous (`POST .../requests/:id/accept` — "accept" can't be expressed by a verb; `DELETE v1/follows/:targetId` — delete *is* unfollow, so the verb suffices).

**Route order matters in NestJS.** Declare literal-prefixed routes before parameterized ones —
`@Get("me/...")` must come before `@Get(":id")`, or `me` is captured as the `:id` value. Leave a comment
on any non-obvious ordering. The module's prefix is locked when its first controller ships; changing it
later breaks every client.
