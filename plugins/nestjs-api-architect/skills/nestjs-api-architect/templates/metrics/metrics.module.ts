// MetricsModule — serves GET /metrics via @willsoto/nestjs-prometheus. @Global so the facade
// (MetricsService) and the HttpMetricsInterceptor resolve it anywhere. Node default metrics are on; the
// three HTTP RED series are registered here. Broker/domain series (e.g. Redis-stream consumer metrics)
// are added per-project — never invent a broker that isn't there. See rules/metrics-prometheus.md.
import { Global, Module } from "@nestjs/common";
import {
  PrometheusModule,
  makeCounterProvider,
  makeGaugeProvider,
  makeHistogramProvider,
} from "@willsoto/nestjs-prometheus";
import { MetricsService } from "./metrics.service";
import { PublicMetricsController } from "./public-metrics.controller";

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      controller: PublicMetricsController, // keeps /metrics keyless (see the controller)
      defaultMetrics: { enabled: true },   // Node.js default metrics; never ALSO call collectDefaultMetrics
    }),
  ],
  providers: [
    MetricsService,
    // HTTP RED series — names/labels/buckets are a fleet-wide contract: do not rename or rebucket, or
    // every Grafana panel and alert that references them silently breaks.
    makeCounterProvider({
      name: "http_requests_total",
      help: "Total HTTP requests handled, by method/route/status",
      labelNames: ["method", "route", "status_code"],
    }),
    makeHistogramProvider({
      name: "http_request_duration_seconds",
      help: "HTTP request duration in seconds",
      labelNames: ["method", "route", "status_code"],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    }),
    makeGaugeProvider({
      // intentionally unlabelled — a single global in-flight count
      name: "http_requests_in_flight",
      help: "Number of HTTP requests currently being processed",
    }),
  ],
  exports: [MetricsService],
})
export class MetricsModule {}
