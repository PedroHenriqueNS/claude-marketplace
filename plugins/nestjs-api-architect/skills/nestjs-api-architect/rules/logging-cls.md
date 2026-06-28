# One CLS-aware logger; mask sensitive fields

Inject one project logger everywhere instead of `console`. It is CLS-aware (e.g. via `nestjs-cls`): a
per-request `requestId` (UUID) is set once at the start of the request and the logger prefixes every
line with it, so logs from deep in a use case are still traceable to the request that caused them.

```typescript
// WRONG — console, no correlation, no masking
console.log("user logged in", { email: dto.email, password: dto.password });
```

```typescript
// RIGHT — injected CLS logger; sensitive fields masked at the DTO
this.logger.log(`login ok userId=${user.id}`); // requestId is auto-prefixed

export class LoginDto {
  @ApiProperty() @IsEmail() email!: string;

  @MaskLogger() // value is redacted wherever this DTO is logged
  @ApiProperty() @IsString() password!: string;
}
```

A `LoggingInterceptor` logs each request in and out with timing, and skips silent routes (health checks,
the metrics scrape) so probes don't flood the log. Sensitive DTO fields (`password`, tokens, OTP codes)
carry a `@MaskLogger()`-style marker so they're redacted anywhere the DTO is serialized into a log.

The win is operational: with a `requestId` on every line you can `grep` one request's full lifecycle out
of an interleaved multi-request log, and masking keeps secrets out of whatever ships logs downstream.

**Supersedes `devops-use-logging`** (generic nestjs-best-practices): logging is CLS-correlated by
`requestId` and sensitive fields are masked at the source, not just "structured".
