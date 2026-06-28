// On SIGTERM, flip readiness to not-ready FIRST (H4) so the readiness probe starts returning 503 and
// Kubernetes removes the pod from Service endpoints BEFORE in-flight work drains and the app closes.
// Lives at src/@core/readiness/readiness-shutdown.hook.ts.
//
// IMPORTANT: a standalone hook can't guarantee it runs before another module's drain logic (Nest
// shutdown-hook order is reverse module-init). If your service has a central drain/shutdown service
// (e.g. the outbox drainer), call `readiness.markNotReady()` as ITS first line instead of using this.
import { BeforeApplicationShutdown, Injectable } from "@nestjs/common";
import { ReadinessService } from "./readiness.service";

@Injectable()
export class ReadinessShutdownHook implements BeforeApplicationShutdown {
  constructor(private readonly readiness: ReadinessService) {}

  beforeApplicationShutdown(): void {
    this.readiness.markNotReady();
  }
}
