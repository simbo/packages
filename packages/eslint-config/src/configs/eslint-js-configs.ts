import eslintJs from '@eslint/js';
import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

import type { ConfigsRecord } from '../configs-record.interface.js';
import { noRestrictedGlobalsRule } from '../utils/no-restricted-globals-rule.js';

const rules: Linter.RulesRecord = {
  'arrow-body-style': ['error', 'as-needed'],
  complexity: ['error', { max: 12 }],
  curly: ['error', 'multi-line'],
  'default-case': 'error',
  'no-console': 'error',
  'no-duplicate-imports': 'error',
  'no-irregular-whitespace': ['error', { skipStrings: true }],
  'prefer-template': 'error',
  'unicode-bom': ['error', 'never'],
};

const recommendedNode = defineConfig({
  extends: [eslintJs.configs.recommended],
  rules: {
    ...rules,
    ...noRestrictedGlobalsRule(globals.node, ['console']),
  },
});

const recommendedBrowser = defineConfig({
  extends: [eslintJs.configs.recommended],
  rules: {
    ...rules,
    ...noRestrictedGlobalsRule(globals.browser, ['console']),
  },
});

/**
 * Shared ESLint configurations based on `@eslint/js` configurations.
 *
 * @see {@link https://eslint.org/ Website}
 * @see {@link https://www.npmjs.com/package/@eslint/js Configs}
 * @see {@link https://eslint.org/docs/latest/rules/ Rules}
 */
export const eslintJsConfigs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects based on `@eslint/js`.
   */
  node: {
    /**
     * A recommended ESLint configuration for Node.js projects based on `@eslint/js`.
     */
    recommended: recommendedNode,
  },

  /**
   * ESLint configurations for browser projects based on `@eslint/js`.
   */
  browser: {
    /**
     * A recommended ESLint configuration for browser projects based on `@eslint/js`.
     */
    recommended: recommendedBrowser,
  },
};
