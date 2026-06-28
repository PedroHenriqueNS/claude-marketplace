// MetricsService — a thin facade over the injected prom-client metrics, so recording call-sites depend
// on this and never import prom-client directly. HTTP RED recording only; add broker/domain record
// methods per-project. Lives at src/modules/metrics/metrics.service.ts.
import { Injectable } from "@nestjs/common";
import { InjectMetric } from "@willsoto/nestjs-prometheus";
import { Counter, Gauge, Histogram } from "prom-client";

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric("http_requests_total") private readonly httpRequests: Counter<string>,
    @InjectMetric("http_request_duration_seconds") private readonly httpDuration: Histogram<string>,
    @InjectMetric("http_requests_in_flight") private readonly httpInFlight: Gauge<string>,
  ) {}

  observeHttpRequest(method: string, route: string, statusCode: number, durationSeconds: number): void {
    const labels = { method, route, status_code: String(statusCode) };
    this.httpRequests.inc(labels);
    this.httpDuration.observe(labels, durationSeconds);
  }

  incHttpInFlight(): void {
    this.httpInFlight.inc();
  }

  decHttpInFlight(): void {
    this.httpInFlight.dec();
  }
}
