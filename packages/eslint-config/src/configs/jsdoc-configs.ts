import { defineConfig } from '@eslint/config-helpers';
import type { Linter } from 'eslint';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';

import type { ConfigsRecord } from '../configs-record.interface.js';

const rules: Linter.RulesRecord = {
  'jsdoc/require-hyphen-before-param-description': ['error', 'always'],
  'jsdoc/tag-lines': [
    'error',
    'any',
    {
      count: 1,
      applyToEndTag: false,
      startLines: 1,
      endLines: 0,
      tags: {},
    },
  ],
};

const recommended = defineConfig(
  {
    files: ['**/*.+(ts|tsx|mts|cts|vue)'],
    extends: [
      eslintPluginJsdoc.configs['flat/recommended-typescript-error'],
      eslintPluginJsdoc.configs['flat/stylistic-typescript-error'],
    ],
    rules,
  },
  {
    files: ['**/*.+(js|jsx|mjs|cjs)'],
    extends: [eslintPluginJsdoc.configs['flat/recommended-error'], eslintPluginJsdoc.configs['flat/recommended-error']],
    rules,
  },
);

/**
 * Shared ESLint configurations based on `eslint-plugin-jsdoc` configurations.
 *
 * @see {@link https://github.com/gajus/eslint-plugin-jsdoc Website}
 * @see {@link https://github.com/gajus/eslint-plugin-jsdoc#configuration Configs}
 * @see {@link https://github.com/gajus/eslint-plugin-jsdoc#rules Rules}
 */
export const jsdocConfigs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects based on `eslint-plugin-jsdoc`.
   */
  node: {
    /**
     * A recommended ESLint configuration for Node.js projects based on `eslint-plugin-jsdoc`.
     */
    recommended,
  },

  /**
   * ESLint configurations for browser projects based on `eslint-plugin-jsdoc`.
   */
  browser: {
    /**
     * A recommended ESLint configuration for browser projects based on `eslint-plugin-jsdoc`.
     */
    recommended,
  },
};
