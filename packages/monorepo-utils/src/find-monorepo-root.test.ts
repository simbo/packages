import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, type Fixture } from '../tests/fixture.js';

import { findMonorepoRoot } from './find-monorepo-root.js';

describe('findMonorepoRoot()', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  it('finds the root of a pnpm monorepo from a workspace', async () => {
    await fixture.pnpmMonorepo();

    await expect(findMonorepoRoot({ workingDir: join(fixture.root, 'packages/a') })).resolves.toBe(fixture.root);
  });

  it('finds the root of an npm monorepo with a lockfile', async () => {
    await fixture.npmMonorepo(true);

    await expect(findMonorepoRoot({ workingDir: fixture.root })).resolves.toBe(fixture.root);
  });

  it('returns undefined if no monorepo contains the directory', async () => {
    await expect(findMonorepoRoot({ workingDir: fixture.root })).resolves.toBeUndefined();
  });

  it('searches from the current working directory by default', async () => {
    await expect(findMonorepoRoot()).resolves.toBe(resolve(import.meta.dirname, '../../..'));
  });
});
