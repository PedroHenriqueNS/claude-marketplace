// ReadinessHealthIndicator — reports the ReadinessService flag as a terminus indicator, so a flipped
// flag (during graceful drain) makes /health/ready return 503. Lives at src/modules/health/readiness.health.ts.
//
// Terminus 11 API: inject HealthIndicatorService and return indicator.up()/down(). The pre-v11
// `extends HealthIndicator` + `throw new HealthCheckError(...)` pattern is removed — don't reintroduce it.
import { Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";
import { ReadinessService } from "@/@core/readiness/readiness.service";

@Injectable()
export class ReadinessHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly readiness: ReadinessService,
  ) {}

  check(key = "readiness") {
    const indicator = this.healthIndicatorService.check(key);
    return this.readiness.isReady() ? indicator.up() : indicator.down({ reason: "draining" });
  }
}
