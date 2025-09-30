import { defineConfig } from 'eslint/config';

import { configs, globals } from '../src/index.js';

export default defineConfig({
  languageOptions: {
    globals: { ...globals.node },
    parserOptions: {
      project: ['./tsconfig.node.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  extends: [configs.node.recommended],
});
