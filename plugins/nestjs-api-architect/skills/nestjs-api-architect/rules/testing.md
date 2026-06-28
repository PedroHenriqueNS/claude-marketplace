# Unit-test services; integration-test controllers against a real DB

Two tiers, each matched to what it actually de-risks:

- **Unit tests** cover use-case services and shared-layer operations in isolation, mocking their
  injected repositories/gateways. They pin down branch logic, validation, and error paths fast.
- **Integration tests** cover controllers end-to-end against a **real test database** — not a mocked
  repository. The whole point is to catch what mocks hide: a wrong SQL predicate, a migration that
  doesn't match the entity, a partial unique index that doesn't fire. Mocking the DB here would test the
  mock, not the system.

Tests are `*.spec.ts`, run with `@nestjs/testing` (`Test.createTestingModule`) and `supertest` for HTTP.

```typescript
// RIGHT — validation failures throw synchronously; assert the throw, don't await a rejection
it("rejects a missing required field", () => {
  expect(() => FollowUserInput.of({ viewerId } as never, true)).toThrow(BadRequestException);
});

// RIGHT — controller integration against a real test DB
it("POST /v1/follows/:targetId follows a public user", async () => {
  await request(app.getHttpServer())
    .post(`/v1/follows/${targetId}`)
    .set("X-App-api-key", apiKey)
    .set("Authorization", `Bearer ${viewerToken}`)
    .expect(HttpStatus.NO_CONTENT);
});
```

A subtlety worth knowing: `BaseClass.of(input, true)` throws **synchronously** — it is not a rejected
promise. Assert with `expect(() => ...).toThrow(...)`, not `await expect(...).rejects`.

Cover the happy path and each error path for every mutating endpoint (unique conflict, not-found,
validation, downstream failure rollback). CI runs the suite on every PR; integration specs need the
test DB up.

**Supersedes `test-use-testing-module` and `test-e2e-supertest`** (generic nestjs-best-practices):
controller tests run against a real database by design — mocked-repository controller tests are
explicitly not the bar here.
