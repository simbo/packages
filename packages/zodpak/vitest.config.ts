import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['{src,tests}/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      exclude: [
        '{dist,tests,mocks,coverage}/**/*',
        'src/**/*.{type,types,interface,interfaces,enum}.ts',
        'src/**/index.ts',
        '*.config.ts',
      ],
    },
  },
});
