# Validation is owned by `BaseService.execute` — no global `ValidationPipe`

Validation runs at the input boundary of every use case, inside `BaseService.execute()`, via
`BaseClass.of(input, true)`. Never register a global `ValidationPipe`. The two validation layers stay
separate and that separation is deliberate:

- **HTTP-layer DTOs** (`application/dtos/`) use `class-validator` decorators for request parsing and
  Swagger documentation — they describe the wire shape.
- **Domain `Input` classes** (`domain/<use-case>/input.ts`) use `class-validator` decorators for actual
  validation, fired by `BaseService.execute()` the moment the use case is invoked.

```typescript
// WRONG — a global pipe makes validation an ambient HTTP concern,
// invisible at the use case and skipped entirely on service-to-service calls
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

```typescript
// RIGHT — the use case validates its own input, every time it is called
export class FollowUserService extends BaseService<FollowUserInput, FollowUserOutput> {
  protected async perform(input: FollowUserInput): Promise<FollowUserOutput> {
    // input is already validated — BaseService.execute() ran BaseClass.of(input, true)
    ...
  }
}
```

The reason a global pipe is the wrong home: it only fires for data that arrives through the HTTP
request pipeline. A use case invoked by another use case (or by a worker) would skip validation
entirely. Anchoring validation in `BaseService.execute()` means *every* invocation — HTTP, worker,
service-to-service — passes the same gate, and the validation lives next to the contract it enforces.

**Supersedes `api-use-pipes`** (generic nestjs-best-practices): validation is a domain-boundary
responsibility owned by `BaseService`, not an HTTP pipe bolted on globally.
