import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * A temporary directory for monorepos written by tests.
 */
export interface Fixture {
  /**
   * The real path of the temporary directory.
   */
  root: string;

  /**
   * Writes a file below the temporary directory and creates its parent directories.
   *
   * @param path - The path relative to the temporary directory.
   * @param content - The file content; objects are written as JSON.
   */
  write: (path: string, content: string | object) => Promise<void>;

  /**
   * Writes a workspace with a valid manifest and README.
   *
   * @param dir - The workspace directory relative to the temporary directory.
   * @param name - The package name.
   */
  workspace: (dir: string, name: string) => Promise<void>;

  /**
   * Writes a pnpm monorepo with the workspaces `packages/b` and `packages/a`.
   */
  pnpmMonorepo: () => Promise<void>;

  /**
   * Writes an npm monorepo with the workspace `packages/a`.
   *
   * @param lockfile - Whether to write a `package-lock.json`.
   */
  npmMonorepo: (lockfile: boolean) => Promise<void>;

  /**
   * Removes the temporary directory.
   */
  cleanup: () => Promise<void>;
}

/**
 * Creates an empty temporary directory for writing monorepos.
 *
 * @returns The fixture.
 */
export async function createFixture(): Promise<Fixture> {
  const tempDir = await mkdtemp(join(tmpdir(), 'monorepo-utils-'));
  const root = await realpath(tempDir);

  const write: Fixture['write'] = async (path, content) => {
    const file = join(root, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, typeof content === 'string' ? content : JSON.stringify(content));
  };

  const workspace: Fixture['workspace'] = async (dir, name) => {
    await write(join(dir, 'package.json'), { name, version: '1.0.0', description: `The ${name} package.` });
    await write(join(dir, 'README.md'), `# ${name}\n`);
  };

  const pnpmMonorepo: Fixture['pnpmMonorepo'] = async () => {
    await write('package.json', { name: 'root', private: true });
    await write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
    await workspace('packages/b', '@scope/b');
    await workspace('packages/a', '@scope/a');
  };

  const npmMonorepo: Fixture['npmMonorepo'] = async lockfile => {
    await write('package.json', { name: 'root', private: true, workspaces: ['packages/*'] });
    if (lockfile) {
      await write('package-lock.json', { name: 'root', lockfileVersion: 3, packages: {} });
    }
    await workspace('packages/a', '@scope/a');
  };

  const cleanup: Fixture['cleanup'] = async () => {
    await rm(root, { recursive: true, force: true });
  };

  return { root, write, workspace, pnpmMonorepo, npmMonorepo, cleanup };
}
