import { createValidationFunction } from '@simbo/zodpak';

import { optionsSchema } from './options-schema.js';

/**
 * Validates the options for the CLI.
 *
 * @param input - The options to validate.
 * @returns The validated options.
 * @throws {ValidationError} If the options are invalid.
 */
export const validateOptions = createValidationFunction(optionsSchema);
