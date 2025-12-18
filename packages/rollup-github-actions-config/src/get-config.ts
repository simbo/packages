import commonjsDefault from '@rollup/plugin-commonjs';
import jsonDefault from '@rollup/plugin-json';
import nodeResolveDefault from '@rollup/plugin-node-resolve';
import terserDefault from '@rollup/plugin-terser';
import typescriptDefault from '@rollup/plugin-typescript';
import { defineConfig, type RollupOptions } from 'rollup';

import type { RollupGithubActionsConfigOptions } from './get-config-options.interface.js';

/**
 * Stupid workaround for rollup plugins not exporting ESM types correctly.
 */
const commonjs = commonjsDefault as unknown as typeof commonjsDefault.default;
const nodeResolve = nodeResolveDefault as unknown as typeof nodeResolveDefault.default;
const typescript = typescriptDefault as unknown as typeof typescriptDefault.default;
const terser = terserDefault as unknown as typeof terserDefault.default;
const json = jsonDefault as unknown as typeof jsonDefault.default;

/**
 * Suppress known warnings in Rollup build.
 * Map of warning codes to keywords in the warning message.
 */
const KNOWN_WARNINGS = {};

/**
 * Get a Rollup configuration for building GitHub Actions using Typescript.
 *
 * @param userOptions - Partial configuration options to override defaults.
 * @returns The Rollup configuration object.
 */
export function getConfig(userOptions: Partial<RollupGithubActionsConfigOptions> = {}): RollupOptions {
  const options: RollupGithubActionsConfigOptions = {
    tsconfig: 'tsconfig.build.json',
    minify: true,
    ...userOptions,
    knownWarnings: {
      ...KNOWN_WARNINGS,
      ...userOptions.knownWarnings,
    },
  };

  return defineConfig({
    input: 'src/index.ts',
    output: {
      esModule: true,
      dir: 'dist',
      format: 'es',
      sourcemap: false,
    },

    onwarn: (warning, warn) => {
      // Suppress known warnings
      for (const [code, keys] of Object.entries(options.knownWarnings)) {
        if (warning.code === code && keys.some(key => warning.message.includes(key))) {
          return;
        }
      }
      // Use default warning handler for other warnings
      warn(warning);
    },

    plugins: [
      typescript({
        tsconfig: options.tsconfig,
        // rollup typescript plugin does not fully support tsconfig extends.
        // so we need to specify the module type explicitly.
        // https://github.com/rollup/plugins/issues/1583
        module: 'NodeNext',
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ['node'],
      }),
      commonjs(),
      json(),
      ...(options.minify ? [terser()] : []),
    ],
  });
}
