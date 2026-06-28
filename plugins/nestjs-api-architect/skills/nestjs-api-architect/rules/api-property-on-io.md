# Input/Output classes are the Swagger schema

> **DDD lens:** the `Input`/`Output` classes are the published contract of a use case — the OpenAPI doc is generated from them, so they double as the bounded context's outward-facing schema.

Every **body-sourced** field on a service `Input` or `Output` class carries `@ApiProperty(...)`
(required) or `@ApiPropertyOptional(...)` (optional), from `@nestjs/swagger`. The decorator is the
only thing that surfaces a field in the OpenAPI document, drives client-SDK codegen, and gives a
reviewer one place to read the wire contract. `class-validator` decorators alone never reach Swagger —
without `@ApiProperty` the generated schema is empty even though the class is fully typed.

```typescript
// WRONG — field is invisible in OpenAPI; generated client SDKs miss it
export class LoginOutput extends BaseClass {
  @IsString()
  accessToken!: string;
}
```

```typescript
// RIGHT — Swagger-documented and class-validator-decorated
export class LoginOutput extends BaseClass {
  @ApiProperty({
    description: "Short-lived bearer token issued by the IdP.",
    example: "eyJhbGciOiJSUzI1NiIs...",
  })
  @IsString()
  accessToken!: string;
}
```

Apply it to every `domain/<use-case>/{input,output}.ts` and every shared-layer
`{repositories,gateways,factories,services}/<group>/<op>/{input,output}.ts`.

**Two field kinds get no `@ApiProperty` — each with a one-line comment saying why:**

```typescript
// Injected from @CurrentUser() — never on the wire; no @ApiProperty.
@IsUUID()
userId!: string;

// TX handle — never on the wire; no @ApiPropertyOptional.
@IsOptional()
txEntityManager?: EntityManager;
```

The reasoning: auth-injected fields (`userId`, `viewerId`, …) are determined server-side from the
token, so documenting them would make a generated SDK ask the caller for a value the server already
knows. The `txEntityManager` is a transaction handle, not a wire field.

`@Param()` / `@Query()` values are a grey zone: they *are* on the wire (URL path / query string) but
are documented on the controller's `Api<Route>Doc()` helper via `@ApiParam` / `@ApiQuery`, **not** via
the service `Input`. So they also get no `@ApiProperty` here. Concretely: only fields that arrive in the
**request body** get `@ApiProperty` on a service `Input`.
