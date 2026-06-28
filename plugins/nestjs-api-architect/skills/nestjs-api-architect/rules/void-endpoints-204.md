# No-body endpoints return 204 — never `return {}`

An endpoint with no meaningful response body must return `204 No Content`, not a fake empty object.
`return {}` ships an empty JSON payload, forcing every client to handle "200 OK with `{}`" — which is
meaningless — and the drift compounds: if some endpoints return `{}`, some `null`, and some 204, every
client and test has to handle three shapes for the same semantic. `204` is the HTTP-spec answer for
"succeeded, nothing to say."

A void endpoint has four parts that agree:

1. `@HttpCode(HttpStatus.NO_CONTENT)` on the method
2. return type `Promise<void>`
3. no `return` statement in the body
4. documented via `@ApiNoContentResponse({ description })`, not `@ApiOkResponse(...)`

```typescript
// WRONG — fakes an empty body, returns 200, lies in the OpenAPI doc
@Post("requests/:id/reject")
@ApiRejectFollowRequestDoc()  // contains ApiOkResponse(...)
async reject(@Param("id") id: string): Promise<Record<string, never>> {
  await this.rejectRequest.execute(RejectFollowRequestInput.of({ id }));
  return {};
}
```

```typescript
// RIGHT — 204, no body; type system, Nest, and OpenAPI all agree
@Post("requests/:id/reject")
@HttpCode(HttpStatus.NO_CONTENT)
@ApiRejectFollowRequestDoc()  // contains ApiNoContentResponse(...)
async reject(@Param("id") id: string): Promise<void> {
  await this.rejectRequest.execute(RejectFollowRequestInput.of({ id }));
}
```

This covers DELETEs, idempotent rejects, soft-deletes, settings updates that return nothing — anything
where success carries no useful payload.
