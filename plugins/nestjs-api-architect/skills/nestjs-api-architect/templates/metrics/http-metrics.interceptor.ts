// HttpMetricsInterceptor — records the HTTP RED metrics (count, duration, in-flight) once per request.
// Register as a global APP_INTERCEPTOR, separate from LoggingInterceptor (one concern each). Lives at
// src/@core/interceptors/http-metrics.interceptor.ts.
//
// Adapt two seams: the non-HTTP skip (here the generic `context.getType() !== "http"`; with a broker
// SDK use its context guard, e.g. isRabbitContext) and the route-pattern read (Express `req.route?.path`;
// Fastify `request.routeOptions?.url`). See rules/metrics-prometheus.md.
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request, Response } from "express";
import { finalize, Observable, tap } from "rxjs";
import { MetricsService } from "@/modules/metrics/metrics.service";

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Skip non-HTTP executions (e.g. a message-broker consumer) before touching switchToHttp().
    if (context.getType() !== "http") return next.handle();

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    // The matched route PATTERN (e.g. /users/:id), never the raw URL — raw URLs mint a series per id and
    // blow up cardinality (C7). Unmatched routes fall back to "unknown".
    const route: string = req.route?.path ?? "unknown";

    // Don't count Prometheus self-scrapes of /metrics.
    if (route === "/metrics") return next.handle();

    const method = req.method;
    const start = Date.now();

    this.metrics.incHttpInFlight();
    return next.handle().pipe(
      tap({
        next: () =>
          this.metrics.observeHttpRequest(method, route, res.statusCode, (Date.now() - start) / 1000),
        error: (err: HttpException | Error) =>
          this.metrics.observeHttpRequest(method, route, this.statusFrom(err), (Date.now() - start) / 1000),
      }),
      // finalize fires on complete, error, AND unsubscribe (client disconnect) — the in-flight gauge can
      // never leak (C8). Increment is AFTER the skips, so skipped paths never inc and never need a dec.
      finalize(() => this.metrics.decHttpInFlight()),
    );
  }

  // On error the exception filter hasn't written res.statusCode yet, so derive the status from the
  // exception; a non-HttpException is unhandled → the filter maps it to 500 (C9).
  private statusFrom(err: HttpException | Error): number {
    return err instanceof HttpException ? err.getStatus() : 500;
  }
}
