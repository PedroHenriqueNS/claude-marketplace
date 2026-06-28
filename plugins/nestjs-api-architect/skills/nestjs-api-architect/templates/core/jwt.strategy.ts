// JwtKeycloakStrategy — verifies the Bearer JWT's signature/issuer/expiry against the IdP's JWKS.
// Lives at src/@core/guards/jwt.strategy.ts. The strategy name ("jwt-keycloak") MUST match the
// AuthGuard name in jwt.guard.ts. Rename "Keycloak" to your IdP everywhere, in sync.
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { passportJwtSecret } from "jwks-rsa";
import { EnvService } from "@/@core/config/env.service";

// Documented `type` exception: the raw token payload shape (see rules/runtime-emitted-constructs.md).
export interface IdpJwtPayload {
  sub: string;
  email: string;
  preferred_username: string;
  name?: string;
}

@Injectable()
export class JwtKeycloakStrategy extends PassportStrategy(Strategy, "jwt-keycloak") {
  constructor(env: EnvService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      issuer: env.get("IDP_ISSUER"),
      algorithms: ["RS256"],
      // jwks-rsa caches keys; keep rateLimit:false so a burst of first-time verifications
      // doesn't get throttled into spurious 401s.
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: env.get("IDP_JWKS_URI"),
        cache: true,
        rateLimit: false,
      }),
    });
  }

  // Passport calls this after signature/issuer/exp pass. Return the typed payload; the
  // sync interceptor later swaps it for the DB user attached to request.user.
  validate(payload: IdpJwtPayload): IdpJwtPayload {
    if (!payload?.sub) throw new UnauthorizedException();
    return payload;
  }
}
