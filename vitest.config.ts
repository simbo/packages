import { readFile } from 'node:fs/promises';

import { defineConfig } from 'vitest/config';

// The workspace patterns of the root package.json; pnpm-workspace.yaml lists the same.
const { workspaces } = JSON.parse(await readFile(new URL('package.json', import.meta.url), 'utf8')) as {
  workspaces: string[];
};

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html', 'lcov'],
      include: [...workspaces.map(pattern => `${pattern}/src/**/*.ts`), 'scripts/*.js'],
      exclude: workspaces.flatMap(pattern => [
        `${pattern}/src/**/*.{type,types,interface,interfaces,enum}.ts`,
        `${pattern}/src/**/index.ts`,
      ]),
    },
    projects: [
      ...workspaces,
      {
        // Keep the root configuration out of this project.
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
