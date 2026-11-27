import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, type Fixture } from '../tests/fixture.js';

import { getWorkspacePaths } from './get-workspace-paths.js';

describe('getWorkspacePaths()', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('returns the workspace paths relative to the root, sorted by path', async () => {
    await fixture.pnpmMonorepo();

    await expect(getWorkspacePaths({ workingDir: join(fixture.root, 'packages/b') })).resolves.toEqual([
      'packages/a',
      'packages/b',
    ]);
  });

  it('returns absolute paths', async () => {
    await fixture.npmMonorepo(true);

    await expect(getWorkspacePaths({ workingDir: fixture.root, absolutePaths: true })).resolves.toEqual([
      join(fixture.root, 'packages/a'),
    ]);
  });

  it('rejects if no monorepo is found', async () => {
    await expect(getWorkspacePaths({ workingDir: fixture.root })).rejects.toThrow('No monorepo found');
  });
});
