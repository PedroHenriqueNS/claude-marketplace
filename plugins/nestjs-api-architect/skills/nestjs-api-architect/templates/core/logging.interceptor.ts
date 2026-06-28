// LoggingInterceptor — logs each request in/out with timing. Registered once as a global
// APP_INTERCEPTOR. Skips noisy infra routes (health, metrics) unless a debug header asks for them.
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

const SILENT_ROUTES = new Set<string>(["/core/health", "/metrics"]);
const DEBUG_HEADER = "x-<app>-log-silent"; // set to "true" to re-enable logging on a silent route

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const silent = SILENT_ROUTES.has(req.path) && req.header(DEBUG_HEADER) !== "true";
    if (silent) return next.handle();

    const startedAt = Date.now();
    this.logger.log(`--> ${req.method} ${req.originalUrl}`);

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(`<-- ${req.method} ${req.originalUrl} (${Date.now() - startedAt}ms)`),
        error: () => this.logger.warn(`<-- ${req.method} ${req.originalUrl} FAILED (${Date.now() - startedAt}ms)`),
      }),
    );
  }
}
