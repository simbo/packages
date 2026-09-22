import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import { defineConfig } from 'eslint/config';

import type { ConfigsRecord } from '../configs-record.interface.js';
import { setRulesToOff } from '../utils/set-rules-to-off.js';

const recommended = defineConfig({
  extends: [eslintPluginUnicorn.configs.all],
  rules: {
    'unicorn/consistent-function-scoping': ['error', { checkArrowFunctions: false }],
    'unicorn/import-style': [
      'error',
      { styles: { path: { named: true } }, extendDefaultStyles: false, checkDynamicImport: false },
    ],
    'unicorn/no-useless-undefined': ['error', { checkArguments: false }],

    /**
     * Disabled Rules
     */
    ...setRulesToOff([
      // too opinionated
      'unicorn/consistent-boolean-name',
      'unicorn/name-replacements',
      'unicorn/no-array-reduce',
      'unicorn/no-asterisk-prefix-in-documentation-comments',
      'unicorn/no-await-expression-member',
      'unicorn/no-barrel-files',
      'unicorn/no-computed-property-existence-check',
      'unicorn/no-unnecessary-global-this',
      'unicorn/no-unreadable-object-destructuring',
      'unicorn/no-useless-switch-case',
      'unicorn/prefer-error-is-error',
      'unicorn/try-complexity',

      // conflicts with other rules
      'unicorn/prefer-await',
      'unicorn/consistent-arrow-return-style',
      'unicorn/consistent-class-member-order',

      // too new
      'unicorn/prefer-regexp-escape',
      'unicorn/prefer-temporal',
      'unicorn/prefer-iterator-to-array',
    ]),
  },
});

/**
 * Shared ESLint configurations based on `eslint-plugin-unicorn` configurations.
 *
 * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn Website}
 * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn#preset-configs Configs}
 * @see {@link https://github.com/sindresorhus/eslint-plugin-unicorn#rules Rules}
 */
export const unicornConfigs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects based on `eslint-plugin-unicorn`.
   */
  node: {
    /**
     * A recommended ESLint configuration for Node.js projects based on `eslint-plugin-unicorn`.
     */
    recommended,
  },

  /**
   * ESLint configurations for browser projects based on `eslint-plugin-unicorn`.
   */
  browser: {
    /**
     * A recommended ESLint configuration for browser projects based on `eslint-plugin-unicorn`.
     */
    recommended,
  },
};
