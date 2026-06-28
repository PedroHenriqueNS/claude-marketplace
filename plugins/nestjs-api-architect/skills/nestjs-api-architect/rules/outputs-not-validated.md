# Outputs are not validated at runtime

`BaseService.execute` validates its `input` via `BaseClass.of(input, true)`, but it does **not** validate
the result of `perform()`. Output classes extend `BaseClass` only so callers can build them with typed
construction — `XOutput.of({...})` (no second `true` argument) runs `plainToInstance` but not
`validateSync`.

```typescript
// WRONG — re-validating trusted internal output on the response path
protected async perform(input: MeInput): Promise<MeOutput> {
  const out = MeOutput.of({ id: user.id, email: user.email }, true); // ← don't validate outputs
  return out;
}
```

```typescript
// RIGHT — construct typed, return; no runtime output validation
protected async perform(input: MeInput): Promise<MeOutput> {
  return MeOutput.of({ id: user.id, email: user.email });
}
```

- `class-validator` decorators on output fields are tolerated (harmless, and they can feed future
  OpenAPI tooling) but never required.
- Repository / gateway / factory `execute()` methods follow the same rule: validate input, return
  outputs directly.
- Never propose adding `output.validate()` or any equivalent on the request/response path.

The reasoning is a trust boundary: inputs cross from caller-supplied / HTTP data and need validation;
outputs are produced by trusted internal code (services, repositories, gateways), so validating them
adds runtime cost and conflates contract enforcement with type safety. Defensive checks on output
shape belong in unit tests, not in the hot path.

**Supersedes `security-sanitize-output`** (generic nestjs-best-practices): output is trusted internal
data; the response path neither serializes-to-strip nor re-validates it.
