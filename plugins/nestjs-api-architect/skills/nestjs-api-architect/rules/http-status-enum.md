# Use the `HttpStatus` enum, never numeric literals

Every reference to an HTTP status code uses the `HttpStatus` enum from `@nestjs/common`. Numeric
literals (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `500`, …) are banned in source — they are
magic numbers that force every reader to mentally translate `204 → "No Content"` on each pass, while
the enum reads as English, autocompletes, and is typo-safe.

```typescript
// WRONG — magic numbers
@HttpCode(204)
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 500, type: ErrorResponseDto })
```

```typescript
// RIGHT — self-documenting
import { Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";

@HttpCode(HttpStatus.NO_CONTENT)
@ApiResponse({ status: HttpStatus.BAD_REQUEST, type: ErrorResponseDto })
@ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, type: ErrorResponseDto })
```

Applies to `@HttpCode(...)`, `@ApiResponse({ status })`, and any other API surface that takes a status
code (interceptors, exception-filter helpers, response builders).

**One exception:** the status *value* inside the exception envelope returned to clients stays a number —
that is the wire format, not source-code control flow. Prefer the typed shorthand response decorators
(`@ApiOkResponse`, `@ApiNoContentResponse`, …) which infer the status from their name and need no
`status:` at all; reserve `@ApiResponse({ status: HttpStatus.X })` for codes the shorthands don't cover.
