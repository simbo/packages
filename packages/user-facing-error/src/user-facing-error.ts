import { stringifyError } from '@simbo/stringify-error';

import type { Hint, SecondParam } from './user-facing-error.types.js';

/**
 * An error that will be displayed to the user.
 *
 * Beside the main message, it can include an additional hint message to help
 * the user resolve the issue.
 *
 * The hint option can also be `true` to indicate that a generic hint should be
 * shown. (e.g. refer to `--help`).
 *
 * This class extends the standard Error class and also accepts an ErrorOptions
 * object including the `hint` property beside other standard error properties
 * like `cause`.
 */
export class UserFacingError extends Error {
  public override readonly name = 'UserFacingError';
  public readonly hint: Hint;

  /**
   * Creates a new UserFacingError instance.
   *
   * @param message - The main error message.
   * @param options - Optional hint or ErrorOptions.
   */
  public constructor(message: string, options?: SecondParam) {
    super(message, typeof options === 'object' ? options : undefined);
    this.hint = this.#getHintValue(options);
  }

  /**
   * Creates a UserFacingError from another error, wrapping it with a new message.
   * It can also include a hint string or boolean.
   *
   * @param error - The original error to wrap.
   * @param message - The new message for the UserFacingError.
   * @param options - Optional hint or ErrorOptions.
   * @returns A new UserFacingError instance.
   */
  public static from(error: unknown, message: string, options?: SecondParam): UserFacingError {
    const secondParam: SecondParam = {
      ...(typeof options === 'object' && (options as unknown) !== null
        ? options
        : {
            hint: options as Hint,
          }),
      cause: error,
    };
    return new UserFacingError(`${message} (${stringifyError(error)})`, secondParam);
  }

  /**
   * Extracts the hint value from the options.
   *
   * @param options - The options to extract the hint from.
   * @returns The hint value or undefined.
   */
  #getHintValue(options?: SecondParam): Hint {
    return options === true || typeof options === 'string'
      ? options
      : typeof options === 'object' &&
          (options as unknown) !== null &&
          (options.hint === true || typeof options.hint === 'string')
        ? options.hint
        : undefined;
  }
}
