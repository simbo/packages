export * from './no-restricted-globals-rule.js';
export * from './set-rules-to-off.js';

/**
 * Re-export configuration utilities from dependencies.
 */
export { defineConfig, globalIgnores } from '@eslint/config-helpers';
export { default as globals } from 'globals';
export { parser } from 'typescript-eslint';
