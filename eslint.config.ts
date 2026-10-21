import { configs, globals } from '@simbo/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/', '**/docs/']),
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
    files: ['scripts/*.js'],
    // JavaScript signatures use JSDoc; TypeScript syntax cannot be written here.
    // Keep type-aware rules and the shared JavaScript JSDoc requirements active.
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
]) as unknown;
