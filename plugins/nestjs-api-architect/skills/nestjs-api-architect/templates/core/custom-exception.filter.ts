// CustomExceptionFilter — the ONE place every error becomes a response. Register it once as a
// global APP_FILTER. Controllers never return raw errors. The log keeps full internal detail;
// the response envelope is generic and never names an internal service.
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";
import { BaseException } from "../exceptions/base.exception";
import { CustomLogger } from "../loggers/custom-logger";

interface ErrorEnvelope {
  status: number; // wire format — a NUMBER, not the HttpStatus enum
  code?: string;
  message: string;
  cause?: unknown;
}

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const envelope = this.normalize(exception);

    // Log the real error (internal names allowed here — logs are exempt).
    this.logger.error(
      `Request failed (${envelope.status} ${envelope.code ?? "ERROR"}): ${String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(envelope.status).json(envelope);
  }

  private normalize(exception: unknown): ErrorEnvelope {
    if (exception instanceof BaseException || exception instanceof HttpException) {
      const body = exception.getResponse();
      const status = exception.getStatus();
      if (typeof body === "object" && body !== null) {
        const b = body as Record<string, unknown>;
        return {
          status,
          code: typeof b.code === "string" ? b.code : undefined,
          message: typeof b.message === "string" ? b.message : exception.message,
          cause: b.cause,
        };
      }
      return { status, message: String(body) };
    }

    // Unknown error: do not leak its message to the client.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    };
  }
}
