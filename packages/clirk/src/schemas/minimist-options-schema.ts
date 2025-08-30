import { nonEmptyStringOrArrayOfStringsSchema, nonEmptyStringSchema } from '@simbo/zodpak';
import { z } from 'zod';

import type { MinimistOptions } from '../types/minimist-options.interface.js';

import { arrayifyString, arrayifyStringRecords } from './utils.js';

export const minimistOptionsSchema = z.strictObject({
  string: nonEmptyStringOrArrayOfStringsSchema.transform(arrayifyString).optional().default([]),
  boolean: nonEmptyStringOrArrayOfStringsSchema.transform(arrayifyString).optional().default([]),
  alias: z
    .record(nonEmptyStringSchema, nonEmptyStringOrArrayOfStringsSchema)
    .transform(arrayifyStringRecords)
    .optional()
    .default({}),
  default: z.record(z.string(), z.any()).optional().default({}),
}) satisfies z.ZodType<unknown, MinimistOptions>;

export type ParsedMinimistOptions = z.output<typeof minimistOptionsSchema>;
