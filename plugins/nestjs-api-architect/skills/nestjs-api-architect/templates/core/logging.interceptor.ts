// LoggingInterceptor — logs each request in/out with timing. Registered once as a global
// APP_INTERCEPTOR. Fully silences scrape routes (/metrics) and silences Kubernetes probe SUCCESS by
// User-Agent (kube-probe/*); a failing probe still logs. See rules/health-liveness-readiness.md.
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { CustomLogger } from "../loggers/custom-logger";

const SILENT_ROUTES = new Set<string>(["/metrics"]); // fully silent (scrape noise)
const DEBUG_HEADER = "x-<app>-log-silent"; // set to "true" to re-enable logging on a silent route

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    if (SILENT_ROUTES.has(req.path) && req.header(DEBUG_HEADER) !== "true") return next.handle();

    // Silence Kubernetes probe SUCCESS by User-Agent, never by URL (H2) — keying on /health would also
    // hide a human curling it. A FAILING probe still logs on the error path below (H3).
    const isProbe = (req.header("user-agent") ?? "").startsWith("kube-probe/");

    const startedAt = Date.now();
    if (!isProbe) this.logger.log(`--> ${req.method} ${req.originalUrl}`);

    return next.handle().pipe(
      tap({
        next: () => {
          if (!isProbe) this.logger.log(`<-- ${req.method} ${req.originalUrl} (${Date.now() - startedAt}ms)`);
        },
        error: () => this.logger.warn(`<-- ${req.method} ${req.originalUrl} FAILED (${Date.now() - startedAt}ms)`),
      }),
    );
  }
}
