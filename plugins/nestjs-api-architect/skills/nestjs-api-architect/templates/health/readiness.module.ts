// ReadinessModule — @Global so the health module (the indicator) AND the app-level shutdown hook
// share ONE ReadinessService instance, without the health route-module leaking into infra (H6).
// Import it ONCE in the root module. Lives at src/@core/readiness/readiness.module.ts.
import { Global, Module } from "@nestjs/common";
import { ReadinessService } from "./readiness.service";
import { ReadinessShutdownHook } from "./readiness-shutdown.hook";

@Global()
@Module({
  providers: [ReadinessService, ReadinessShutdownHook],
  exports: [ReadinessService],
})
export class ReadinessModule {}
