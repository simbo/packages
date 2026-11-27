import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('@simbo/call-prettier', () => ({
  callPrettier: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@simbo/clirk', () => ({
  clirk: vi.fn().mockResolvedValue({ args: { _: [] } }),
}));

const { callPrettier } = vi.mocked(await import('@simbo/call-prettier'));

const { monorepoPackagesListCli } = await import('./monorepo-packages-list-cli.js');

/**
 * Tests that the CLI finds the monorepo root in a real monorepo, without a Git repository.
 */
describe('monorepoPackagesListCli() in a real monorepo', () => {
  let root: string;

  /**
   * Writes a file below the temporary directory and creates its parent directories.
   *
   * @param path - The path relative to the temporary directory.
   * @param content - The file content.
   */
  const write = async (path: string, content: string): Promise<void> => {
    const file = join(root, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, content);
  };

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'monorepo-packages-list-cli-'));
    root = await realpath(tempDir);
    await write('package.json', JSON.stringify({ name: 'root', private: true }));
    await write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
    await write('README.md', '# Root\n\n<!-- PACKAGES -->\n<!-- /PACKAGES -->\n');
    await write(
      'packages/a/package.json',
      JSON.stringify({ name: '@scope/a', version: '1.0.0', description: 'The a package.' }),
    );
    await write('packages/a/README.md', '# Package A\n');
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await rm(root, { recursive: true, force: true });
  });

  it('updates the target file at the monorepo root when run from a workspace', async () => {
    await monorepoPackagesListCli(join(root, 'packages/a'));

    await expect(readFile(join(root, 'README.md'), 'utf8')).resolves.toContain('@scope/a');
    expect(callPrettier).toHaveBeenCalledWith('README.md', { workingDir: root });
  });

  it('fails outside a monorepo', async () => {
    await rm(join(root, 'pnpm-workspace.yaml'));

    await expect(monorepoPackagesListCli(join(root, 'packages/a'))).rejects.toThrow(
      `Monorepo root not found starting from: ${join(root, 'packages/a')}`,
    );
  });
});
