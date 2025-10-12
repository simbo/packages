import { defineConfig, globalIgnores } from 'eslint/config';

import { configs, globals } from './src/index.js';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/']),
  {
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.js', '.*.js'],
      },
    },
    extends: [configs.node.recommended],
  },
  {
    files: ['mocks/**/*.ts', 'mocks/**/*.js'],
    rules: {
      'n/no-unpublished-import': 'off',
    },
  },
]) as unknown;
