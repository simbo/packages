import type { Linter } from 'eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';

import type { ConfigsRecord } from '../configs-record.interface.js';

/**
 * Prettier's ESLint configurations exports rules that override and disable
 * known ESLint rules that are considered unnecessary or might conflict with
 * prettier's formatting.
 *
 * We want to filter Prettier's overrides and keep some rules active.
 *
 * These rules are excluded from Prettier's disabled rules list:
 */
const EXCLUDE_FROM_DISABLED_RULES = new Set(['curly']);

const rules: Linter.RulesRecord = {};

for (const name in eslintConfigPrettier.rules) {
  if (!EXCLUDE_FROM_DISABLED_RULES.has(name)) {
    rules[name] = 'off';
  }
}

const recommended = defineConfig({ rules });

/**
 * Shared ESLint configurations based on `eslint-config-prettier` rules.
 *
 * @see {@link https://prettier.io/docs/en/integrating-with-linters.html Website}
 */
export const prettierConfigs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects based on `eslint-config-prettier`.
   */
  node: {
    /**
     * A recommended ESLint configuration for Node.js projects based on `eslint-config-prettier`.
     */
    recommended,
  },

  /**
   * ESLint configurations for browser projects based on `eslint-config-prettier`.
   */
  browser: {
    /**
     * A recommended ESLint configuration for browser projects based on `eslint-config-prettier`.
     */
    recommended,
  },
};
