import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createFixture, type Fixture } from '../tests/fixture.js';

import { findMonorepo, getMonorepo } from './get-monorepo.js';

describe('get-monorepo', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  describe('findMonorepo()', () => {
    it('returns the root and the workspaces sorted by path', async () => {
      await fixture.pnpmMonorepo();

      const monorepo = await findMonorepo(join(fixture.root, 'packages/b'));

      expect(monorepo?.rootDir).toBe(fixture.root);
      expect(monorepo?.packages.map(({ relativeDir }) => relativeDir)).toEqual(['packages/a', 'packages/b']);
    });

    it('returns undefined for npm workspaces without a lockfile', async () => {
      await fixture.npmMonorepo(false);

      await expect(findMonorepo(fixture.root)).resolves.toBeUndefined();
    });

    it('returns undefined for a single package', async () => {
      await fixture.workspace('.', 'single');

      await expect(findMonorepo(fixture.root)).resolves.toBeUndefined();
    });

    it('returns undefined for a directory without a package', async () => {
      await expect(findMonorepo(fixture.root)).resolves.toBeUndefined();
    });

    it('rejects if a workspace manifest is invalid', async () => {
      await fixture.pnpmMonorepo();
      await fixture.write('packages/a/package.json', '{');

      await expect(findMonorepo(fixture.root)).rejects.toThrow(
        new RegExp(`^Failed to read the monorepo at ${fixture.root}: `),
      );
    });
  });

  describe('getMonorepo()', () => {
    it('returns the monorepo', async () => {
      await fixture.npmMonorepo(true);

      await expect(getMonorepo(fixture.root)).resolves.toMatchObject({ rootDir: fixture.root });
    });

    it('rejects if no monorepo is found', async () => {
      await fixture.npmMonorepo(false);

      await expect(getMonorepo(fixture.root)).rejects.toThrow(`No monorepo found from ${fixture.root}.`);
    });

    it('rejects if the monorepo has no workspaces', async () => {
      await fixture.write('package.json', { name: 'root', private: true });
      await fixture.write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');

      await expect(getMonorepo(fixture.root)).rejects.toThrow(`No workspaces found in ${fixture.root}.`);
    });
  });
});
