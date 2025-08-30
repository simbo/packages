import { configs, defineConfig, globalIgnores, globals } from '@simbo/eslint-config';

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
]);
