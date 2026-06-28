// HealthModule — wires terminus + the liveness/readiness controller. Lives at src/modules/health/health.module.ts.
// Register it in the root module. ReadinessService comes from the @Global ReadinessModule (import that
// once in the root too). TypeOrmHealthIndicator is provided by TerminusModule and needs the DB
// connection already configured (the root TypeOrmModule).
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { ReadinessHealthIndicator } from "./readiness.health";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [ReadinessHealthIndicator],
})
export class HealthModule {}
