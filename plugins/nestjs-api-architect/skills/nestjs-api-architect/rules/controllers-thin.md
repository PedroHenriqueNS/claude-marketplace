# Controllers do route + input + call. Nothing else.

> **DDD lens:** the controller is the application layer's delivery mechanism — it adapts HTTP to a
> use-case call and nothing more. All domain work, including wire-shape conversion, belongs to the use
> case.

Every controller method has exactly three jobs:

1. **Route mapping** — the `@Get/@Post/@Patch/@Delete` decorator, path, status code, and the `Api<Route>Doc()` Swagger helper.
2. **Pull caller data** — `@CurrentUser()`, `@Param()`, `@Query()`, `@Body()`.
3. **Call the use case** via `<X>Input.of({...})` and return its result.

No `.map(...)`, no `Date.toISOString()`, no field rename, no shape reshape, no `as unknown as` cast, no
branching on the response. The controller's return type **is** the service's `Output` class — return it
directly. Any wire-format conversion (Date → ISO string, renames, reshaping) happens in the service's
`perform()`, and the service's `output.ts` declares wire-shape types (`createdAt: string`, not `Date`).

```typescript
// WRONG — controller reshapes the service output and casts
async pending(@CurrentUser() u: AuthenticatedUser): Promise<PendingRequestsResponseDto> {
  const out = await this.listPending.execute(ListPendingFollowRequestsInput.of({ viewerId: u.id }));
  return {
    incoming: out.incoming.map((it) => ({ id: it.id, otherUser: it.requester, createdAt: it.createdAt.toISOString() })),
    outgoing: out.outgoing.map((it) => ({ id: it.id, otherUser: it.target, createdAt: it.createdAt.toISOString() })),
  };
}

// RIGHT — the service already emits the wire shape; the controller is one line
async pending(@CurrentUser() u: AuthenticatedUser): Promise<ListPendingFollowRequestsOutput> {
  return this.listPending.execute(ListPendingFollowRequestsInput.of({ viewerId: u.id }));
}
```

Why: a controller has no business knowing which fields the wire wants versus what the repository returns.
Putting the mapping in the service keeps the protocol-vs-domain boundary clean — the service's `Output`
*is* the API contract, the repository's output stays private to the service, and a contract change (add
a field, rename one) happens in one place instead of in every controller that calls the use case. This
is what lets every controller method stay a cast-free one-liner.

**On DTOs.** When a per-endpoint `<X>ResponseDto` only duplicates the service `<X>Output` shape, delete
it and point `@ApiOkResponse({ type: <X>Output })` at the output (which carries its own `@ApiProperty`
decorators — see `api-property-on-io`). `<X>RequestDto` files for request bodies stay: they live in the
application layer, decode the wire body, and feed cleaned values into `<X>Input.of({...})` (the body and
the service input often differ — e.g. the controller adds `viewerId: user.id` from `@CurrentUser()`).

**Supersedes `api-use-dto-serialization`** (generic nestjs-best-practices): no response-DTO middleman and
no serialization interceptor — the service `Output` is the serialized contract, returned directly.
