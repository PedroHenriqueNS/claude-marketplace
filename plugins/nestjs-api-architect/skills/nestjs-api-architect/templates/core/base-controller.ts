// BaseController — every feature controller extends this so both guards apply by default.
// The layered guard contract lives here, in ONE place; feature modules never call @UseGuards().
// Opt a single route out with @SkipApiKey() (perimeter) and/or @PublicRoute() (identity).
import { UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "../guards/api-key.guard";
import { JwtKeycloakGuard } from "../guards/jwt.guard";

@UseGuards(ApiKeyGuard, JwtKeycloakGuard)
export abstract class BaseController {}
