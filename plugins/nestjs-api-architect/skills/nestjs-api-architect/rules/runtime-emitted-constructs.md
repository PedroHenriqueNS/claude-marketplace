# Prefer runtime-emitted constructs over `type` / `interface`

> **DDD lens:** the domain model has to *exist* at runtime — aggregates, value sets, and contracts that
> decorator metadata, DI, and `instanceof` can reach. A `type` or `interface` is erased at compile time
> and leaves nothing behind, so it can't carry the model.

NestJS builds emit JavaScript. `type` aliases and `interface` declarations are stripped during
compilation and have no runtime existence — they cannot be referenced by decorator metadata, by
`instanceof`, by an injection token, or by any code path that needs the value at runtime. So when you
define a finite set of values, a data shape, or a cross-boundary contract, reach for `enum`, `class`,
or `abstract class` instead.

```typescript
// WRONG — erased at compile time; unreachable by metadata or instanceof
type UserRole = "admin" | "moderator" | "member";
interface CreateUserInput { email: string; role: UserRole }
```

```typescript
// RIGHT — survives to runtime; usable by decorators, DI, and instanceof
export enum UserRoleEnum {
  ADMIN = "admin",
  MODERATOR = "moderator",
  MEMBER = "member",
}

export class CreateUserInput extends BaseClass {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: UserRoleEnum })
  @IsEnum(UserRoleEnum)
  role!: UserRoleEnum;
}
```

Concretely:

- A finite string union → `enum` with explicit string values; members are `UPPER_SNAKE_CASE`.
- A data shape used as a controller parameter, a service `Input`/`Output`, or anything inspected by
  decorator metadata → `class` (with `!` on fields the constructor doesn't initialise).
- A behaviour contract with a default implementation → `abstract class` (also a DI token).

**Two unavoidable exceptions** — keep `type` here, with a comment explaining why:

1. A name for a *callable* shape (constructor signatures, function-type aliases) — there is no
   runtime construct for "a function of this shape".
2. A type *derived from a runtime schema*, e.g. `type Env = z.infer<typeof envSchema>`. The schema is
   the runtime source of truth; the alias is a derived editor aid.

A project may also document one or two carrier-backed exceptions (e.g. an `AuthenticatedUser` that is
`UserEntity & { roles: UserRoleEnum[] }` — the runtime carrier is the entity, the intersection is
editor-only). Document them; don't let them multiply.

**Supersedes `di-use-interfaces-tokens` and `di-interface-segregation`** (generic nestjs-best-practices):
those favour interface-first contracts; here the contract must be runtime-emitted, so an `abstract class`
is the DI token and the segregation boundary, not an `interface`.
