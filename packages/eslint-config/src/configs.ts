import { defineConfig } from 'eslint/config';

import type { ConfigsRecord } from './configs-record.interface.js';
import { eslintJsConfigs } from './configs/eslint-js-configs.js';
import { jsdocConfigs } from './configs/jsdoc-configs.js';
import { nConfigs } from './configs/n-configs.js';
import { prettierConfigs } from './configs/prettier-configs.js';
import { testingConfigs } from './configs/testing-configs.js';
import { typescriptEslintConfigs } from './configs/typescript-eslint-configs.js';
import { unicornConfigs } from './configs/unicorn-configs.js';

const recommendedNode = defineConfig([
  eslintJsConfigs.node.recommended,
  typescriptEslintConfigs.node.recommended,
  unicornConfigs.node.recommended,
  jsdocConfigs.node.recommended,
  nConfigs.node.recommended,
  prettierConfigs.node.recommended,
  testingConfigs.node.recommended,
]);

const recommendedBrowser = defineConfig([
  eslintJsConfigs.browser.recommended,
  typescriptEslintConfigs.browser.recommended,
  unicornConfigs.browser.recommended,
  jsdocConfigs.browser.recommended,
  prettierConfigs.browser.recommended,
  testingConfigs.browser.recommended,
]);

/**
 * Shared ESLint configurations.
 */
export const configs: ConfigsRecord = {
  /**
   * ESLint configurations for Node.js projects.
   */
  node: {
    /**
     * Recommended ESLint configuration for Node.js projects.
     */
    recommended: recommendedNode,
  },

  /**
   * ESLint configurations for browser projects.
   */
  browser: {
    /**
     * Recommended ESLint configuration for browser projects.
     */
    recommended: recommendedBrowser,
  },
};
