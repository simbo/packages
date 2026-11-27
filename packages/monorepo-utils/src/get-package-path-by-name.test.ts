import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, type Fixture } from '../tests/fixture.js';

import { getPackagePathByName } from './get-package-path-by-name.js';

describe('getPackagePathByName()', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('returns the path of a workspace relative to the root', async () => {
    await fixture.pnpmMonorepo();

    await expect(getPackagePathByName('@scope/b', { workingDir: join(fixture.root, 'packages/a') })).resolves.toBe(
      'packages/b',
    );
  });

  it('returns an absolute path', async () => {
    await fixture.pnpmMonorepo();

    await expect(getPackagePathByName('@scope/b', { workingDir: fixture.root, absolute: true })).resolves.toBe(
      join(fixture.root, 'packages/b'),
    );
  });

  it('rejects if no workspace has the name', async () => {
    await fixture.pnpmMonorepo();

    await expect(getPackagePathByName('@scope/c', { workingDir: fixture.root })).rejects.toThrow(
      'Package "@scope/c" not found in workspaces.',
    );
  });

  it('rejects if no monorepo is found', async () => {
    await expect(getPackagePathByName('@scope/a', { workingDir: fixture.root })).rejects.toThrow('No monorepo found');
  });
});
