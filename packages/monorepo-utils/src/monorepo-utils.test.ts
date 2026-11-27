import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { findMonorepoRoot, getPackagePathByName, getWorkspacePaths, readWorkspaces } from './index.js';

/**
 * Tests the public functions against real monorepos in a temporary directory.
 */
describe('monorepo-utils', () => {
  let root: string;

  /**
   * Writes a file below the temporary directory and creates its parent directories.
   *
   * @param path - The path relative to the temporary directory.
   * @param content - The file content; objects are written as JSON.
   */
  const write = async (path: string, content: string | object): Promise<void> => {
    const file = join(root, path);
    await mkdir(resolve(file, '..'), { recursive: true });
    await writeFile(file, typeof content === 'string' ? content : JSON.stringify(content));
  };

  /**
   * Writes a workspace with a valid manifest and README.
   *
   * @param dir - The workspace directory relative to the temporary directory.
   * @param name - The package name.
   */
  const workspace = async (dir: string, name: string): Promise<void> => {
    await write(join(dir, 'package.json'), { name, version: '1.0.0', description: `The ${name} package.` });
    await write(join(dir, 'README.md'), `# ${name}\n`);
  };

  /**
   * Writes a pnpm monorepo with the workspaces `packages/b` and `packages/a`.
   */
  const pnpmMonorepo = async (): Promise<void> => {
    await write('package.json', { name: 'root', private: true });
    await write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
    await workspace('packages/b', '@scope/b');
    await workspace('packages/a', '@scope/a');
  };

  /**
   * Writes an npm monorepo with the workspace `packages/a`.
   *
   * @param lockfile - Whether to write a `package-lock.json`.
   */
  const npmMonorepo = async (lockfile: boolean): Promise<void> => {
    await write('package.json', { name: 'root', private: true, workspaces: ['packages/*'] });
    if (lockfile) {
      await write('package-lock.json', { name: 'root', lockfileVersion: 3, packages: {} });
    }
    await workspace('packages/a', '@scope/a');
  };

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'monorepo-utils-'));
    root = await realpath(tempDir);
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  describe('findMonorepoRoot()', () => {
    it('finds the root of a pnpm monorepo from a workspace', async () => {
      await pnpmMonorepo();

      await expect(findMonorepoRoot({ workingDir: join(root, 'packages/a') })).resolves.toBe(root);
    });

    it('finds the root of an npm monorepo with a lockfile', async () => {
      await npmMonorepo(true);

      await expect(findMonorepoRoot({ workingDir: root })).resolves.toBe(root);
    });

    it('returns undefined for npm workspaces without a lockfile', async () => {
      await npmMonorepo(false);

      await expect(findMonorepoRoot({ workingDir: root })).resolves.toBeUndefined();
    });

    it('returns undefined for a single package', async () => {
      await workspace('.', 'single');

      await expect(findMonorepoRoot({ workingDir: root })).resolves.toBeUndefined();
    });

    it('returns undefined for a directory without a package', async () => {
      await expect(findMonorepoRoot({ workingDir: root })).resolves.toBeUndefined();
    });

    it('searches from the current working directory by default', async () => {
      await expect(findMonorepoRoot()).resolves.toBe(resolve(import.meta.dirname, '../../..'));
    });

    it('rejects if a workspace manifest is invalid', async () => {
      await pnpmMonorepo();
      await write('packages/a/package.json', '{');

      await expect(findMonorepoRoot({ workingDir: root })).rejects.toThrow(/^Failed to read the monorepo at /);
    });
  });

  describe('getWorkspacePaths()', () => {
    it('returns the workspace paths relative to the root, sorted by path', async () => {
      await pnpmMonorepo();

      await expect(getWorkspacePaths({ workingDir: join(root, 'packages/b') })).resolves.toEqual([
        'packages/a',
        'packages/b',
      ]);
    });

    it('returns absolute paths', async () => {
      await npmMonorepo(true);

      await expect(getWorkspacePaths({ workingDir: root, absolutePaths: true })).resolves.toEqual([
        join(root, 'packages/a'),
      ]);
    });

    it('rejects if no monorepo is found', async () => {
      await npmMonorepo(false);

      await expect(getWorkspacePaths({ workingDir: root })).rejects.toThrow(`No monorepo found from ${root}.`);
    });

    it('rejects if the monorepo has no workspaces', async () => {
      await write('package.json', { name: 'root', private: true });
      await write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');

      await expect(getWorkspacePaths({ workingDir: root })).rejects.toThrow(`No workspaces found in ${root}.`);
    });
  });

  describe('getPackagePathByName()', () => {
    it('returns the path of a workspace by its name', async () => {
      await pnpmMonorepo();

      await expect(getPackagePathByName('@scope/b', { workingDir: root })).resolves.toBe('packages/b');
      await expect(getPackagePathByName('@scope/b', { workingDir: root, absolute: true })).resolves.toBe(
        join(root, 'packages/b'),
      );
    });

    it('rejects if no workspace has the name', async () => {
      await pnpmMonorepo();

      await expect(getPackagePathByName('@scope/c', { workingDir: root })).rejects.toThrow(
        'Package "@scope/c" not found in workspaces.',
      );
    });
  });

  describe('readWorkspaces()', () => {
    it('reads the metadata of all workspaces, sorted by path', async () => {
      await pnpmMonorepo();

      const workspaces = await readWorkspaces({ workingDir: join(root, 'packages/a'), concurrency: 1 });

      expect(
        workspaces.map(({ name, relativePath, absolutePath, title }) => ({ name, relativePath, absolutePath, title })),
      ).toEqual([
        { name: '@scope/a', relativePath: 'packages/a', absolutePath: join(root, 'packages/a'), title: '@scope/a' },
        { name: '@scope/b', relativePath: 'packages/b', absolutePath: join(root, 'packages/b'), title: '@scope/b' },
      ]);
    });

    it('reports every workspace that cannot be read', async () => {
      await pnpmMonorepo();
      await workspace('packages/c', '@scope/c');
      await rm(join(root, 'packages/a/README.md'));
      await rm(join(root, 'packages/c/README.md'));

      await expect(readWorkspaces({ workingDir: root })).rejects.toThrow(
        /^Failed to read workspaces: packages\/a \(Failed to read README\.md at packages\/a: .+\), packages\/c \(Failed to read README\.md at packages\/c: .+\)$/,
      );
    });

    it('rejects an invalid concurrency', async () => {
      await pnpmMonorepo();

      await expect(readWorkspaces({ workingDir: root, concurrency: 0 })).rejects.toThrow(TypeError);
    });
  });
});
