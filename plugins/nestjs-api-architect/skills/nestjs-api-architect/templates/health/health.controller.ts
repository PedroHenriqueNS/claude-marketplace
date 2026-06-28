// HealthController — Kubernetes liveness + readiness probes. Lives at src/modules/health/health.controller.ts.
//
// Reachable WITHOUT auth (probes carry no credentials, H5): it does NOT extend BaseController and also
// carries @SkipApiKey()+@PublicRoute() to cover the case where the guards are registered as APP_GUARDs.
// In main.ts, exclude `health` from the global prefix so the paths stay /health/live and /health/ready.
import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from "@nestjs/terminus";
import { PublicRoute, SkipApiKey } from "@/@core/decorators/decorators";
import { ReadinessHealthIndicator } from "./readiness.health";

@SkipApiKey()
@PublicRoute()
@Controller("health")
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly readiness: ReadinessHealthIndicator,
  ) {}

  // Liveness: NO dependencies (H1). Healthy whenever the process responds. A failing liveness probe
  // makes Kubernetes RESTART the pod — so a transient DB/broker blip must never reach here.
  @Get("live")
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  // Readiness: real dependencies + the drain flag. A failure makes Kubernetes stop routing traffic
  // (NOT restart). Add each dependency whose absence means "don't send me traffic" (broker, cache, …).
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck("database"),
      () => this.readiness.check("readiness"),
    ]);
  }
}
