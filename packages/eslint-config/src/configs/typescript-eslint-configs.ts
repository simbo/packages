import { defineConfig } from 'eslint/config';
import typescriptEslint from 'typescript-eslint';

import type { ConfigsRecord } from '../configs-record.interface.js';

import { typescriptEslintRules } from './typescript-eslint-rules.js';

const recommended = defineConfig({
  extends: [typescriptEslint.configs.strictTypeChecked, typescriptEslint.configs.stylisticTypeChecked],
  rules: typescriptEslintRules,
});

/**
 * Shared ESLint configurations based on `typescript-eslint` configurations.
 *
 * @see {@link https://typescript-eslint.io/ Website}
 * @see {@link https://typescript-eslint.io/users/configs Configs}
 * @see {@link https://typescript-eslint.io/rules/ Rules}
 */
export const typescriptEslintConfigs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects based on `typescript-eslint`.
   */
  node: {
    /**
     * A recommended ESLint config for Node.js projects based on `typescript-eslint`.
     */
    recommended,
  },

  /**
   * ESLint configurations for browser projects based on `typescript-eslint`.
   */
  browser: {
    /**
     * A recommended ESLint config for browser projects based on `typescript-eslint`.
     */
    recommended,
  },
};
