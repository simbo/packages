import { rm } from 'node:fs/promises';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, type Fixture } from '../tests/fixture.js';

import { readWorkspaces } from './read-workspaces.js';

describe('readWorkspaces()', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    fixture = await createFixture();
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await fixture.cleanup();
  });

  it('reads the metadata of all workspaces, sorted by path', async () => {
    await fixture.pnpmMonorepo();

    const workspaces = await readWorkspaces({ workingDir: join(fixture.root, 'packages/a'), concurrency: 1 });

    expect(
      workspaces.map(({ name, relativePath, absolutePath, title }) => ({ name, relativePath, absolutePath, title })),
    ).toEqual([
      {
        name: '@scope/a',
        relativePath: 'packages/a',
        absolutePath: join(fixture.root, 'packages/a'),
        title: '@scope/a',
      },
      {
        name: '@scope/b',
        relativePath: 'packages/b',
        absolutePath: join(fixture.root, 'packages/b'),
        title: '@scope/b',
      },
    ]);
  });

  it('reads all workspaces in CI', async () => {
    vi.stubEnv('CI', 'true');
    await fixture.pnpmMonorepo();

    await expect(readWorkspaces({ workingDir: fixture.root })).resolves.toHaveLength(2);
  });

  it('reports a workspace that cannot be read', async () => {
    await fixture.pnpmMonorepo();
    await rm(join(fixture.root, 'packages/b/README.md'));

    await expect(readWorkspaces({ workingDir: fixture.root })).rejects.toThrow(
      /^Failed to read workspace: packages\/b \(Failed to read README\.md at packages\/b: .+\)$/,
    );
  });

  it('reports every workspace that cannot be read', async () => {
    await fixture.pnpmMonorepo();
    await fixture.workspace('packages/c', '@scope/c');
    await rm(join(fixture.root, 'packages/a/README.md'));
    await rm(join(fixture.root, 'packages/c/README.md'));

    await expect(readWorkspaces({ workingDir: fixture.root })).rejects.toThrow(
      /^Failed to read workspaces: packages\/a \(.+\), packages\/c \(.+\)$/,
    );
  });

  it('rejects an invalid concurrency', async () => {
    await fixture.pnpmMonorepo();

    await expect(readWorkspaces({ workingDir: fixture.root, concurrency: 0 })).rejects.toThrow(TypeError);
  });
});
