import { optionsSchema } from '@simbo/monorepo-packages-list';
import { createValidationFunction, nonEmptyStringSchema } from '@simbo/zodpak';
import { z } from 'zod';

/**
 * The configuration object schema.
 */
export const configObjectSchema = optionsSchema.omit({ workingDir: true }).safeExtend({
  targetFile: nonEmptyStringSchema.optional().default('README.md'),
});

/**
 * The configuration schema.
 *
 * Input can be a single configuration object or an array of configuration objects.
 * Output will be an array of configuration objects.
 */
export const configSchema = z
  .union([configObjectSchema, z.array(configObjectSchema).min(1)])
  .transform(value => (Array.isArray(value) ? value : [value]));

/**
 * A helper function to define the configuration object with proper types.
 *
 * @param config - The configuration object or array of objects to define.
 * @returns The defined configuration object or array of objects.
 */
export const defineConfig = (config: Config): Config => config;

/**
 * Validates the user configuration object.
 * If validation fails, a user-friendly ValidationError is thrown.
 *
 * @param input - The input to validate.
 * @returns The validated output.
 * @throws {ValidationError} If the input is invalid.
 */
export const validateConfig = createValidationFunction(configSchema);

/**
 * The user configuration object.
 */
export type Config = z.input<typeof configSchema>;

/**
 * The parsed and validated configuration object.
 */
export type ValidatedConfig = z.output<typeof configSchema>;
