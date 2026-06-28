# Two layered guards, applied once via `BaseController`

> **DDD lens:** auth is infrastructure, not domain. It is wired once at the framework edge; a bounded
> context never re-decides it.

Two independent guards run on every route by default, both applied through `BaseController` which every
controller extends:

1. **Perimeter guard** — an edge API-key check (`X-<App>-api-key` against an `API_KEY` env var). It
   establishes that the request came through the trusted edge. Opt a route out with `@SkipApiKey()`
   (for K8s probes, the metrics scrape).
2. **Identity guard** — a JWT check against the IdP's JWKS (passport-jwt + `jwks-rsa`, cached). It
   establishes *who* the caller is. Opt a route out with `@PublicRoute()` (registration, login, JWKS
   proxy, password reset).

The two are orthogonal — a route may carry one, both, or neither decorator:

```typescript
// WRONG — re-deciding auth inside a feature module
@Controller("v1/users")
export class UsersController {
  @Get("me")
  @UseGuards(JwtAuthGuard)   // ← guards are infra; don't re-apply them per route/module
  async me() { ... }
}
```

```typescript
// RIGHT — guards come from BaseController; routes only opt OUT
@Controller("v1/auth")
export class AuthController extends BaseController {
  @Post("login")
  @PublicRoute()             // skip identity guard; perimeter key still required
  async login(@Body() dto: LoginDto): Promise<LoginOutput> {
    return this.loginService.execute(LoginInput.of(dto));
  }

  @Get("/v1/users/me")       // neither decorator → both guards apply
  async me(@CurrentUser() user: AuthenticatedUser): Promise<MeOutput> { ... }
}
```

Never add `@UseGuards()` inside a feature module — guards are an infrastructure concern, registered once
on `BaseController` (or as `APP_GUARD`). Re-applying them per route risks a second guard instance whose
`@PublicRoute()` reflector lookup silently misbehaves, and it scatters the auth contract across modules.

**Supersedes `security-auth-jwt` and `security-use-guards`** (generic nestjs-best-practices): there are
*two* layered guards (perimeter + identity), they are opt-*out* not opt-in, and they live on the base
controller — not sprinkled per route.
