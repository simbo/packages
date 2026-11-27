import { defineConfig, globalIgnores } from 'eslint/config';

import { configs, globals } from './src/index.js';

export default defineConfig([
  // The runtime test lints mocks/no-sync.ts and expects its sync call to be reported.
  globalIgnores(['dist/', 'coverage/', 'mocks/no-sync.ts']),
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
