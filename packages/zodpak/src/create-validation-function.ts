import { z } from 'zod';
import { createErrorMap, fromError } from 'zod-validation-error';

const ERROR_MAP = createErrorMap();

/**
 * Set a custom error map to create more user-friendly error messages.
 */
z.config({ customError: ERROR_MAP });

/**
 * Creates a validation function for the given zod schema including
 * user-friendly error messages using zod-validation-error.
 *
 * @param schema - The Zod schema to validate against.
 * @returns A function that validates input against the schema.
 */
export function createValidationFunction<S extends z.ZodType>(schema: S): (input: z.input<S>) => z.output<S> {
  /**
   * Validates the input against the schema.
   * If validation fails, a user-friendly ValidationError is thrown.
   *
   * @param input - The input to validate.
   * @returns The validated output.
   * @throws {ValidationError} If the input is invalid.
   */
  return (input: z.input<S>) => {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw fromError(result.error);
    }
    return result.data;
  };
}
