// BaseService — every use case extends this. One use case = one service = one `perform()`.
// `execute()` owns input validation; it deliberately does NOT validate the output.
import { BaseClass } from "./base-class";

export abstract class BaseService<Input extends BaseClass, Output> {
  /** The use case's business logic. Receives an already-validated input. */
  abstract perform(input: Input): Promise<Output>;

  /**
   * The single entry point callers use. Validates the input at the domain boundary, then runs
   * the use case. The output is NOT validated: it is produced by trusted internal code
   * (this service, its repositories and gateways), so validating it would add runtime cost and
   * conflate contract enforcement with type safety. Inputs cross the trust boundary; outputs do not.
   */
  async execute(input: Input): Promise<Output> {
    input.validate();
    return this.perform(input);
  }
}
