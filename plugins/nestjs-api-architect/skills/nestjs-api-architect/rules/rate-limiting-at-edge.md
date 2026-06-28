# Rate limiting lives at the edge gateway — never in-app

All rate limiting is enforced at the edge / API gateway in front of the service (Kong, an ALB +
WAF, an Nginx tier, etc.). The application never returns `429` and never decides throttling in-process —
it trusts that traffic reaching it has already passed the gateway's rate-limit check.

```typescript
// WRONG — in-app throttling duplicates the gateway, drifts from it, and
// couples request handling to a cross-cutting concern that isn't the API's job
@Post("login")
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60_000 } })
async login() { ... }
```

```typescript
// RIGHT — no throttle decorator, no rate-limit guard; the gateway owns it
@Post("login")
@PublicRoute()
async login(@Body() dto: LoginDto): Promise<LoginOutput> {
  return this.loginService.execute(LoginInput.of(dto));
}
```

Don't propose, add, or recommend a `@RateLimit` decorator, a `RateLimitGuard`, `@nestjs/throttler`, or
any in-app counter. If the API genuinely needs to influence the gateway (e.g. move a flagged user into a
tighter consumer group), that is a separate, explicit call to the gateway's Admin API — never an
in-process decision on the request path.

The reasoning: rate limiting is a perimeter concern. Putting it in the app means two systems with two
configs that drift, doubles the enforcement surface, and makes every handler carry policy that has
nothing to do with its domain logic.

**Supersedes `security-rate-limiting`** (generic nestjs-best-practices): that rule says implement
in-app rate limiting; here it is explicitly forbidden — the edge gateway is the only enforcement point.
