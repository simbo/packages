import { z } from 'zod';

/**
 * A zod schema for a non-empty string with a custom error message.
 */
export const nonEmptyStringSchema = z.string().min(1, 'Expected non-empty string');

/**
 * A zod schema for an array of non-empty strings.
 */
export const nonEmptyStringArraySchema = z.array(nonEmptyStringSchema);

/**
 * A zod schema for a non-empty string or an array of non-empty strings.
 */
export const nonEmptyStringOrArrayOfStringsSchema = z.union([nonEmptyStringSchema, nonEmptyStringArraySchema]);
