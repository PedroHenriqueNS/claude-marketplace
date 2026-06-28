# Wrap every call's input in `XInput.of({...})` — never `as never`

> **DDD lens:** `XInput.of({...})` is the invariant-enforcing gate at a boundary. Every call into a
> repository, gateway, factory, or another use case crosses a boundary, so every one gets the gate.

Every call to a repository / gateway / factory / service `execute()` MUST wrap its argument with
`XInput.of({...})`. The `{...} as never` shortcut is forbidden — for repo calls, gateway calls, factory
calls, and service-to-service calls alike.

```typescript
// WRONG — bypasses BaseClass validation and masks a typing problem
await this.someService.execute(SomeServiceInput.of({ foo, bar } as never));
await this.someRepo.execute({ foo, bar } as never);
await this.proxyJwksService.execute(undefined as never);
```

```typescript
// RIGHT — drop the cast; if the Input class has no fields, call .of({})
await this.someService.execute(SomeServiceInput.of({ foo, bar }));
await this.someRepo.execute(SomeRepoInput.of({ foo, bar }));
await this.proxyJwksService.execute(ProxyJwksServiceInput.of({}));
```

The `as never` cast "works" only because `execute` methods don't re-check their argument's type — but
it skips the one runtime check that catches a mistyped field name, a missing required field, or a
wrong-type value. With every input wrapped, every operation has a single trustworthy boundary.

If TypeScript complains *without* the cast, the `Input` class is missing a field or has the wrong type —
**fix the Input, not the call site.** Inside a transaction, the manager handle stays inside the argument:
`InsertFollowInput.of({ followerId, followeeId, txEntityManager: m })`.

There is also a concrete runtime failure: passing `{...} as never` to a service whose receiver later
calls `.of()` on it throws `obj.constructor.of is not a function`, because the plain object was never
turned into the `Input` class instance.

**Supersedes `security-validate-all-input`** (generic nestjs-best-practices): validation isn't only at
the HTTP edge via pipes — it is enforced at *every* internal boundary by constructing the typed `Input`.
