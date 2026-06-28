// BaseException — domain exceptions with a stable, namespaced `code` and a generic `message`.
// Throw these (or built-in HttpException subclasses) from services; CustomExceptionFilter
// normalizes them into the wire envelope. The `message` must never name an internal service.
import { HttpException, HttpStatus } from "@nestjs/common";

export interface BaseExceptionInit {
  /** Stable machine code, e.g. "AUTH_LOGIN.CREDENTIALS_INVALID". */
  code: string;
  /** Human-facing, generic message. Never names the IdP / DB / cache / mailer / etc. */
  message: string;
  status: HttpStatus;
  /** Optional structured detail (validation issues, etc.). Safe to expose. */
  cause?: unknown;
}

export class BaseException extends HttpException {
  readonly code: string;
  readonly cause?: unknown;

  private constructor(init: BaseExceptionInit) {
    super({ code: init.code, message: init.message, cause: init.cause }, init.status);
    this.code = init.code;
    this.cause = init.cause;
  }

  static of(init: BaseExceptionInit): BaseException {
    return new BaseException(init);
  }
}
