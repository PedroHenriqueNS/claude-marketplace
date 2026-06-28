// ReadinessService — a global, manipulable "ready" flag. The readiness probe reports it; the shutdown
// hook flips it to not-ready BEFORE draining so the load balancer stops routing traffic first.
// Lives at src/@core/readiness/readiness.service.ts. See rules/health-liveness-readiness.md.
import { Injectable } from "@nestjs/common";

@Injectable()
export class ReadinessService {
  // Starts ready; flipped to false at the start of graceful shutdown (H4).
  private ready = true;

  isReady(): boolean {
    return this.ready;
  }

  markReady(): void {
    this.ready = true;
  }

  markNotReady(): void {
    this.ready = false;
  }
}
