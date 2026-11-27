import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { afterEach, expect, test } from 'vitest';

import { getVersionBumps } from './version-bumps.js';

const execFileAsync = promisify(execFile);
const script = new URL('version-bumps.js', import.meta.url).pathname;

/**
 * @type {string[]}
 */
const directories = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map(async directory => {
      await rm(directory, { recursive: true, force: true });
    }),
  );
});

/**
 * Runs Git in a fixture repository with a fixed identity.
 *
 * @param {string} cwd - Repository root.
 * @param {string[]} args - Git arguments.
 * @returns {Promise<string>} Standard output.
 */
async function git(cwd, args) {
  const { stdout } = await execFileAsync(
    'git',
    ['-c', 'user.name=Test', '-c', 'user.email=test@example.com', '-c', 'commit.gpgsign=false', ...args],
    { cwd },
  );
  return stdout;
}

/**
 * Writes a workspace with the files `@simbo/monorepo-utils` requires.
 *
 * @param {string} root - Repository root.
 * @param {string} dir - Workspace directory relative to the root.
 * @param {Record<string, unknown>} manifest - Manifest fields besides the description.
 * @returns {Promise<void>} Resolves once the files are written.
 */
async function workspace(root, dir, manifest) {
  await mkdir(join(root, dir), { recursive: true });
  await writeFile(join(root, dir, 'package.json'), JSON.stringify({ description: 'Test.', ...manifest }));
  await writeFile(join(root, dir, 'README.md'), `# ${String(manifest.name)}\n`);
}

/**
 * Creates a committed monorepo with workspaces in two folders.
 *
 * @returns {Promise<string>} Repository root.
 */
async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'version-bumps-'));
  directories.push(root);
  await git(root, ['init', '--quiet']);
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'root', private: true }));
  await writeFile(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - changelog\n');
  await workspace(root, 'packages/a', { name: '@simbo/a', version: '1.0.0' });
  await workspace(root, 'packages/b', { name: '@simbo/b', version: '2.0.0' });
  await workspace(root, 'changelog', { name: 'packages-changelog', version: '1.7.7', private: true });
  await git(root, ['add', '--all']);
  await git(root, ['commit', '--quiet', '--message', 'init']);
  return root;
}

test('reports changed versions in every workspace folder, sorted by name', async () => {
  const root = await fixture();
  await workspace(root, 'packages/b', { name: '@simbo/b', version: '2.1.0' });
  await workspace(root, 'changelog', { name: 'packages-changelog', version: '1.7.8', private: true });
  expect(await getVersionBumps({ root })).toEqual([
    {
      name: '@simbo/b',
      dir: 'packages/b',
      'previous-version': '2.0.0',
      version: '2.1.0',
      private: false,
      tag: '@simbo/b/v2.1.0',
    },
    {
      name: 'packages-changelog',
      dir: 'changelog',
      'previous-version': '1.7.7',
      version: '1.7.8',
      private: true,
      tag: 'packages-changelog/v1.7.8',
    },
  ]);
});

test('counts a workspace missing at the base ref as a bump', async () => {
  const root = await fixture();
  await workspace(root, 'packages/c', { name: '@simbo/c', version: '0.1.0' });
  expect(await getVersionBumps({ root })).toEqual([
    expect.objectContaining({ name: '@simbo/c', 'previous-version': '', tag: '@simbo/c/v0.1.0' }),
  ]);
});

test('compares against another base ref', async () => {
  const root = await fixture();
  await workspace(root, 'packages/a', { name: '@simbo/a', version: '1.1.0' });
  await git(root, ['commit', '--quiet', '--all', '--message', 'bump']);
  expect(await getVersionBumps({ root })).toEqual([]);
  expect(await getVersionBumps({ root, base: 'HEAD~1' })).toEqual([
    expect.objectContaining({ name: '@simbo/a', 'previous-version': '1.0.0', version: '1.1.0' }),
  ]);
});

test('fails for an invalid base ref instead of reporting every workspace', async () => {
  const root = await fixture();
  await expect(getVersionBumps({ root, base: 'no-such-ref' })).rejects.toThrow();
});

test('the CLI writes the outputs for signed-commit and fails without bumps', async () => {
  const root = await fixture();
  const output = join(root, 'github-output');
  await writeFile(output, '');
  const run = async () =>
    execFileAsync(process.execPath, [script], { cwd: root, env: { ...process.env, GITHUB_OUTPUT: output } });

  await expect(run()).rejects.toThrow(/No workspace version changed/);

  await workspace(root, 'packages/a', { name: '@simbo/a', version: '1.0.1' });
  await workspace(root, 'changelog', { name: 'packages-changelog', version: '1.7.8', private: true });
  await run();
  const lines = (await readFile(output, 'utf8')).trimEnd().split('\n');
  expect(lines[1]).toBe('tags=@simbo/a/v1.0.1 packages-changelog/v1.7.8');
  expect(lines[2]).toBe('count=2');
  expect(JSON.parse(lines[0]?.replace(/^packages=/, '') ?? '')).toHaveLength(2);
});
