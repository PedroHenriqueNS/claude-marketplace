// JwtKeycloakGuard — the IDENTITY guard. Verifies a Bearer JWT against the IdP's JWKS via a
// passport-jwt strategy. Applied to every route via BaseController. Opt a route out with
// @PublicRoute() (registration, login, JWKS proxy, password reset — anything pre-identity).
// Rename "Keycloak" to your IdP if you like; keep the strategy name in sync.
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { PUBLIC_ROUTE } from "../decorators/decorators";

@Injectable()
export class JwtKeycloakGuard extends AuthGuard("jwt-keycloak") {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
