import { cwd } from 'node:process';

import type { WorkspaceMetadata } from '@simbo/monorepo-utils';
import { createFunctionSchema, createValidationFunction } from '@simbo/zodpak';
import { z } from 'zod';

import { defaultBeforeFn } from './default-before-fn.js';
import { defaultTemplateFn } from './default-template-fn.js';
import type {
  BeforeAfterFn,
  FilterFn,
  Options,
  SortCompareFn,
  TemplateData,
  TemplateDataFn,
  TemplateFn,
} from './monorepo-packages-list.types.js';

const templateDataFnSchema = createFunctionSchema<TemplateDataFn>();

const templateDataSchema = z.looseObject({
  repoUrlFn: templateDataFnSchema.optional(),
  packageUrlFn: templateDataFnSchema.optional(),
  docsUrlFn: templateDataFnSchema.optional(),
  readmeUrlFn: templateDataFnSchema.optional(),
  changelogUrlFn: templateDataFnSchema.optional(),
}) satisfies z.ZodType<TemplateData>;

const templateFnSchema = createFunctionSchema<TemplateFn>();
const sortCompareFnSchema = createFunctionSchema<SortCompareFn>();
const filterFnSchema = createFunctionSchema<FilterFn>();
const beforeAfterFnSchema = createFunctionSchema<BeforeAfterFn>();

/**
 * The schema for the options for the monorepo packages list.
 */
export const optionsSchema = z.strictObject({
  workingDir: z.string().min(1).optional().default(cwd()),
  templateFn: templateFnSchema.optional().default(() => defaultTemplateFn),
  templateData: templateDataSchema.optional().default({}),
  sortCompareFn: sortCompareFnSchema
    .optional()
    .default(() => (a: WorkspaceMetadata, b: WorkspaceMetadata) => a.relativePath.localeCompare(b.relativePath)),
  filterFn: filterFnSchema.optional().default(() => () => true),
  delimiter: z.string().optional().default('\n\n'),
  before: z
    .union([z.string(), beforeAfterFnSchema])
    .optional()
    .default(() => defaultBeforeFn),
  after: z.union([z.string(), beforeAfterFnSchema]).optional().default(''),
}) satisfies z.ZodType<Options>;

/**
 * Parses the options object.
 *
 * @param input - The options object to validate.
 * @returns The parsed options object.
 * @throws {ValidationError} If the options object is invalid.
 */
export const validateOptions = createValidationFunction(optionsSchema);
