// ApiKeyGuard — the PERIMETER guard. Verifies a shared service key on the `X-<app>-api-key`
// header (set by the edge gateway / trusted callers). Applied to every route via BaseController.
// Opt a route out with @SkipApiKey() (e.g. K8s probes, metrics scrape).
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { timingSafeEqual } from "crypto";
import { Request } from "express";
import { EnvService } from "../config/env.service";
import { SKIP_API_KEY } from "../decorators/decorators";

const HEADER = "x-<app>-api-key"; // replace <app> with your prefix, lowercased

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly env: EnvService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_API_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const provided = req.header(HEADER) ?? "";
    const expected = this.env.get("API_KEY");

    if (!this.safeEqual(provided, expected)) {
      throw new UnauthorizedException({ code: "CORE_AUTH.API_KEY_INVALID", message: "Invalid API key." });
    }
    return true;
  }

  // Constant-time compare to avoid leaking the key length/prefix through timing.
  private safeEqual(a: string, b: string): boolean {
    const ab = Buffer.from(a);
    const bb = Buffer.from(b);
    return ab.length === bb.length && timingSafeEqual(ab, bb);
  }
}
