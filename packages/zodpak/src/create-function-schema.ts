import { z } from 'zod';

/**
 * Creates a Zod schema for a custom function with defined interface.
 *
 * The function itself is not validated beyond being a function.
 * But the interface for the function is fully passed through the dynamic zod types.
 *
 * @param errorMessage - The error message to display when the validation fails.
 * @returns A Zod schema for the function.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function createFunctionSchema<F extends Function>(errorMessage = 'Expected a function'): z.ZodType<F, F> {
  return z.custom<F>(fnValue => typeof fnValue === 'function', errorMessage);
}
