# One use case = one `BaseService`; transactions thread `txEntityManager`

> **DDD lens:** a use case is a domain service — one verb of the bounded context (`FollowUser`,
> `AcceptFollowRequest`, `DeleteAccount`). It owns the invariant; the controller and the repositories
> don't.

Every use case is exactly one class `extends BaseService<Input, Output>` that implements
`protected perform(input)`. The base's `execute()` validates the input (see `validation-baseservice`),
runs `perform()`, and returns the output. The use case is also where wire-shape mapping lives — the
`Output` declares wire types (`createdAt: string`, not `Date`) and `perform()` does any
`.toISOString()` / rename / reshape before returning, so the controller stays a one-liner.

```typescript
// RIGHT — the use case is the unit; perform() holds the logic and the mapping
export class ListPendingService extends BaseService<ListPendingInput, ListPendingOutput> {
  constructor(private readonly listPendingRepo: ListPendingFollowRequestsRepository) { super(); }

  protected async perform(input: ListPendingInput): Promise<ListPendingOutput> {
    const rows = await this.listPendingRepo.execute(
      ListPendingFollowRequestsInput.of({ viewerId: input.viewerId }),
    );
    return ListPendingOutput.of({
      incoming: rows.incoming.map((r) => ({ id: r.id, createdAt: r.createdAt.toISOString() })),
    });
  }
}
```

## Transactions

For work that spans multiple rows or a local write plus one external call, open a
`DataSource.transaction(async (m) => { ... })` callback and thread the active `EntityManager` as a
`txEntityManager` field on each repo operation's `Input`. A repo op runs against that manager when
present, otherwise against its injected `DataSource`.

```typescript
// RIGHT — local writes + one IdP call commit/roll back together
await this.dataSource.transaction(async (m) => {
  await this.updateUsernameRepo.execute(UpdateUsernameInput.of({ userId, username, txEntityManager: m }));
  await this.idpGateway.execute(UpdateIdpUserInput.of({ userId, username })); // inside the TX on purpose
});
```

Keep the lock window to a single row's `UPDATE` plus one external roundtrip; don't stack multiple
external calls inside one transaction — that multiplies the lock window without buying atomicity you
need. Put the external call *inside* the transaction precisely so a failure there rolls the local
writes back.

**Supersedes `db-use-transactions`** (generic nestjs-best-practices): transactions aren't ad-hoc in a
service method — they thread a shared `txEntityManager` through per-operation repos so the same op
works in or out of a transaction.
