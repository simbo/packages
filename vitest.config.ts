import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['packages/*/{src,tests}/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      include: ['packages/*/src/**/*.ts', 'scripts/*.js'],
      exclude: ['packages/*/src/**/*.{type,types,interface,interfaces,enum}.ts', 'packages/*/src/**/index.ts'],
    },
    projects: [
      'packages/*',
      {
        // Keep the root package include pattern out of this project.
        extends: false,
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/*.test.js'],
        },
      },
    ],
  },
});
