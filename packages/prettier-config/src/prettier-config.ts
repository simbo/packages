import type { Config } from 'prettier';

import { importOrderOptions } from './plugin-import-order-options.js';
import { sortAttributesOptions } from './plugin-sort-attributes-options.js';

/**
 * Simbo's shared Prettier configuration.
 *
 * @see {@link https://prettier.io/ Website}
 * @see {@link https://prettier.io/docs/options Options}
 */
export const config: Config = {
  /**
   * Prettier's Native Options
   */
  arrowParens: 'avoid',
  printWidth: 120,
  proseWrap: 'preserve',
  singleQuote: true,

  /**
   * File Overrides
   */
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.mjs', '*.cjs', '*.vue'],
      options: {
        plugins: ['@ianvs/prettier-plugin-sort-imports', 'prettier-plugin-organize-attributes'],
        ...importOrderOptions,
        ...sortAttributesOptions,
      },
    },
    {
      files: ['*.html'],
      options: {
        plugins: ['prettier-plugin-organize-attributes'],
        ...sortAttributesOptions,
      },
    },
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always',
        plugins: [],
      },
    },
    {
      files: '*.svg',
      options: {
        parser: 'html',
      },
    },
  ],
};
