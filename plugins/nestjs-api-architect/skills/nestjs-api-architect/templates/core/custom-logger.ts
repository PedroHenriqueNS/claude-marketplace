// CustomLogger — one logger, CLS-aware, that prefixes every line with the per-request `requestId`
// so a request's logs can be traced end-to-end. Inject it instead of `console` or `new Logger()`.
//
// We override the public methods (stable API) rather than the protected `formatMessage` (whose
// signature shifts between Nest versions) — that keeps this free of the `as never` casts the rest
// of the codebase forbids. The requestId lives in CLS, set once per request (e.g. by nestjs-cls'
// ClsMiddleware / an interceptor).
import { ConsoleLogger, Injectable, Scope } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

@Injectable({ scope: Scope.TRANSIENT })
export class CustomLogger extends ConsoleLogger {
  constructor(private readonly cls: ClsService) {
    super();
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    super.log(this.tag(message), ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    super.error(this.tag(message), ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    super.warn(this.tag(message), ...optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    super.debug(this.tag(message), ...optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    super.verbose(this.tag(message), ...optionalParams);
  }

  private tag(message: unknown): string {
    const requestId = this.cls?.get<string>("requestId") ?? "-";
    return `[${requestId}] ${typeof message === "string" ? message : JSON.stringify(message)}`;
  }
}
