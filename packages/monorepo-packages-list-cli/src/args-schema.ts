import { createValidationFunction, nonEmptyStringOrArrayOfStringsSchema, nonEmptyStringSchema } from '@simbo/zodpak';
import z from 'zod';

const argsSchema = z
  .looseObject({
    /**
     * The config file argument should be a single file path.
     * If multiple file paths are given, only the first one is taken.
     * Defaults to undefined.
     */
    config: nonEmptyStringOrArrayOfStringsSchema
      .optional()
      .transform(value => (Array.isArray(value) ? value[0] : value)),

    /**
     * One or more target files to inject the content into.
     */
    _: z.array(nonEmptyStringSchema).default([]),
  })
  .transform(value => ({
    configFile: value.config,
    targetFiles: value._,
  }));

/**
 * Validates the CLI arguments parsed by minimist.
 * If validation fails, a user-friendly ValidationError is thrown.
 *
 * @param input - The input to validate.
 * @returns The validated output.
 * @throws {ValidationError} If the input is invalid.
 */
export const validateArgs = createValidationFunction(argsSchema);
