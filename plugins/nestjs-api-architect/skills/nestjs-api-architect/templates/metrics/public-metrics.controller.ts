// PublicMetricsController — serves /metrics WITHOUT the auth header (Prometheus scrapers send no
// credentials). Same keyless pattern as the health controller: does NOT extend BaseController, and
// carries @SkipApiKey()+@PublicRoute() to also cover an APP_GUARD setup. /metrics is excluded from the
// global prefix in main.ts. Lives at src/modules/metrics/public-metrics.controller.ts.
//
// `super.index(response)` delegates to willsoto's renderer. Confirm its signature against the installed
// @willsoto/nestjs-prometheus major if a build error points here.
import { Controller, Get, Res } from "@nestjs/common";
import { PrometheusController } from "@willsoto/nestjs-prometheus";
import { Response } from "express";
import { PublicRoute, SkipApiKey } from "@/@core/decorators/decorators";

@Controller("metrics")
export class PublicMetricsController extends PrometheusController {
  @SkipApiKey()
  @PublicRoute()
  @Get()
  async index(@Res({ passthrough: true }) response: Response): Promise<string> {
    return super.index(response);
  }
}
