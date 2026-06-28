// BaseClass — the spine of every Input/Output value object.
// Construct instances ONLY via `XInput.of({...})`. `of(plain, true)` also validates.
// Replace nothing structural; adjust the validation error envelope to your project's shape.
import { BadRequestException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

export abstract class BaseClass {
  /**
   * Build a typed instance from a plain object.
   * - `validate = false` (default): typed construction only (class-transformer runs, no checks).
   * - `validate = true`: also run class-validator and throw on the first set of errors.
   *
   * Callers always go through this (`XInput.of({...})`) instead of `new` or `{...} as never`,
   * so field names and types are checked at compile time and there is exactly one runtime
   * validation boundary.
   */
  static of<T extends BaseClass>(this: new () => T, plain: Partial<T>, validate = false): T {
    const instance = plainToInstance(this as unknown as new () => T, plain, {
      exposeDefaultValues: true,
    });
    if (validate) {
      instance.validate();
    }
    return instance;
  }

  /**
   * Runs class-validator on this instance. Throws SYNCHRONOUSLY (not a rejected promise) —
   * tests assert the throw directly, never `await expect(...).rejects`.
   */
  validate(): void {
    const errors = validateSync(this, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      throw new BadRequestException({
        code: "VALIDATION_FAILED",
        message: "Invalid input.",
        cause: errors,
      });
    }
  }
}
