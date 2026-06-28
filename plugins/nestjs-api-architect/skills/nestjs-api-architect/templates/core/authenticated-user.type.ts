// AuthenticatedUser — the identity attached to request.user after the JWT guard runs, read by the
// @CurrentUser() decorator in controllers. Lives at src/@core/auth/authenticated-user.type.ts.
//
// A CLASS, not an interface, so it survives to runtime (rules/runtime-emitted-constructs.md). Shape
// it to whatever the sync interceptor attaches — typically the DB user row, not the raw JWT payload.
export class AuthenticatedUser {
  id!: string;
  email!: string;
  username!: string;
}
