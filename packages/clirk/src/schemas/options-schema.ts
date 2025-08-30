import { createFunctionSchema, nonEmptyStringOrArrayOfStringsSchema, nonEmptyStringSchema } from '@simbo/zodpak';
import { z } from 'zod';

import type { SigIntHandler } from '../types/clirk-context.interface.js';
import type { ClirkOptions } from '../types/clirk-options.interface.js';

import { minimistOptionsSchema } from './minimist-options-schema.js';
import {
  DEFAULT_MINIMIST_OPTIONS,
  DEFAULT_OPTIONS_LABEL,
  DEFAULT_PARAMETERS_LABEL,
  DEFAULT_SIGINT_HANDLER,
  DEFAULT_SIGINT_MESSAGE,
  DEFAULT_USAGE_LABEL,
} from './options-defaults.js';
import { arrayifyString, arrayifyStringRecords } from './utils.js';

export const optionsSchema = z.strictObject({
  importMetaDirname: nonEmptyStringSchema,
  argsOptions: minimistOptionsSchema.optional().default(DEFAULT_MINIMIST_OPTIONS),
  title: nonEmptyStringSchema,
  name: nonEmptyStringSchema.optional(),
  icon: nonEmptyStringSchema.optional(),
  description: nonEmptyStringOrArrayOfStringsSchema.transform(arrayifyString).optional().default([]),
  examples: nonEmptyStringOrArrayOfStringsSchema.transform(arrayifyString).optional().default([]),
  usage: nonEmptyStringOrArrayOfStringsSchema.transform(arrayifyString).optional().default([]),
  usageLabel: nonEmptyStringSchema.optional().default(DEFAULT_USAGE_LABEL),
  parameters: z
    .record(nonEmptyStringSchema, nonEmptyStringOrArrayOfStringsSchema)
    .transform(arrayifyStringRecords)
    .optional()
    .default({}),
  parametersLabel: nonEmptyStringSchema.optional().default(DEFAULT_PARAMETERS_LABEL),
  options: z
    .record(nonEmptyStringSchema, nonEmptyStringOrArrayOfStringsSchema)
    .transform(arrayifyStringRecords)
    .optional()
    .default({}),
  optionsLabel: nonEmptyStringSchema.optional().default(DEFAULT_OPTIONS_LABEL),
  sigintHandler: z
    .union([createFunctionSchema<SigIntHandler>(), z.literal(false)])
    .optional()
    .default(() => DEFAULT_SIGINT_HANDLER),
  sigintMessage: nonEmptyStringSchema.optional().default(DEFAULT_SIGINT_MESSAGE),
}) satisfies z.ZodType<unknown, ClirkOptions>;

export type ParsedOptions = z.output<typeof optionsSchema>;
