import eslintPluginNode from 'eslint-plugin-n';
import { defineConfig } from 'eslint/config';

import type { ConfigsRecord } from '../configs-record.interface.js';

const recommended = defineConfig({
  extends: [eslintPluginNode.configs['flat/recommended']],
  rules: {
    'n/no-unsupported-features/node-builtins': [
      'error',
      {
        ignores: ['import.meta.dirname'],
      },
    ],
    'n/no-missing-import': [
      'error',
      {
        // seems like this rule has issues with types-only packages
        ignoreTypeImport: true,
      },
    ],
    'n/hashbang': [
      'error',
      {
        convertPath: {
          '**/src/**/*.ts': ['(.+/|^)src/(.+).ts$', '$1dist/$2.js'],
        },
      },
    ],
  },
});

/**
 * Shared ESLint configurations based on `eslint-plugin-n` configurations.
 *
 * @see {@link https://github.com/eslint-community/eslint-plugin-n Website}
 * @see {@link https://github.com/eslint-community/eslint-plugin-n#-configs Configs}
 * @see {@link https://github.com/eslint-community/eslint-plugin-n#-rules Rules}
 */
export const nConfigs: Omit<ConfigsRecord, 'browser'> = {
  /**
   * ESLint configurations for Node.js projects based on `eslint-plugin-n`.
   */
  node: {
    /**
     * A recommended ESLint configuration for Node.js projects based on `eslint-plugin-n`.
     */
    recommended,
  },
};
