import { defineConfig } from 'eslint/config';

import { configs, globals } from '../src/index.js';

export default defineConfig({
  languageOptions: {
    globals: { ...globals.browser },
    parserOptions: {
      project: ['./tsconfig.browser.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  extends: [configs.browser.recommended],
});
