import { chmod, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { findBin } from './find-bin.js';

const EXECUTABLE_MODE = 0o755;
const READ_ONLY_MODE = 0o644;

let root: string;

/**
 * Creates a file with the given mode, including its parent directories.
 *
 * @param path - The path of the file, relative to the temporary root.
 * @param mode - The file mode.
 * @returns The absolute path of the file.
 */
async function createFile(path: string, mode = EXECUTABLE_MODE): Promise<string> {
  const filePath = join(root, path);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, '#!/bin/sh\n');
  await chmod(filePath, mode);
  return filePath;
}

describe('findBin', () => {
  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'find-bin-'));
    root = await realpath(tempDir);
    await mkdir(join(root, 'project', 'packages', 'app'), { recursive: true });
    vi.stubEnv('PATH', [join(root, 'global'), join(root, 'other')].join(delimiter));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(root, { recursive: true, force: true });
  });

  it('finds a binary in the node_modules/.bin directory of the working directory', async () => {
    const binPath = await createFile('project/node_modules/.bin/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('finds a binary in a node_modules/.bin directory up the tree', async () => {
    const binPath = await createFile('project/node_modules/.bin/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project', 'packages', 'app') })).resolves.toBe(binPath);
  });

  it('prefers the nearest node_modules/.bin directory', async () => {
    await createFile('project/node_modules/.bin/tool');
    const binPath = await createFile('project/packages/app/node_modules/.bin/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project', 'packages', 'app') })).resolves.toBe(binPath);
  });

  it('prefers a local binary over one in PATH', async () => {
    await createFile('global/tool');
    const binPath = await createFile('project/node_modules/.bin/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('falls back to the directories in PATH in their order', async () => {
    await createFile('other/tool');
    const binPath = await createFile('global/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('skips files that are not executable', async () => {
    await createFile('project/packages/app/node_modules/.bin/tool', READ_ONLY_MODE);
    await createFile('global/tool', READ_ONLY_MODE);
    const binPath = await createFile('other/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project', 'packages', 'app') })).resolves.toBe(binPath);
  });

  it('skips directories with the name of the binary', async () => {
    await mkdir(join(root, 'project', 'node_modules', '.bin', 'tool'), { recursive: true });
    const binPath = await createFile('global/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('trims the name of the binary', async () => {
    const binPath = await createFile('project/node_modules/.bin/tool');

    await expect(findBin('  tool\n', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('returns undefined if the binary is not found', async () => {
    await createFile('global/other-tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBeUndefined();
  });

  it('looks only in node_modules/.bin directories if PATH is not set', async () => {
    vi.stubEnv('PATH', undefined);
    const binPath = await createFile('project/node_modules/.bin/tool');

    await expect(findBin('tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
    await expect(findBin('other-tool', { workingDir: join(root, 'project') })).resolves.toBeUndefined();
  });

  it('resolves a name with a path separator against the working directory', async () => {
    await createFile('global/scripts/tool');
    const binPath = await createFile('project/scripts/tool');

    await expect(findBin('./scripts/tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
    await expect(findBin('scripts/tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
    await expect(findBin('../project/scripts/tool', { workingDir: join(root, 'project') })).resolves.toBe(binPath);
  });

  it('checks only the given file for an absolute path', async () => {
    const binPath = await createFile('project/scripts/tool');
    const readOnlyPath = await createFile('project/scripts/read-only', READ_ONLY_MODE);

    await expect(findBin(binPath, { workingDir: join(root, 'project', 'packages') })).resolves.toBe(binPath);
    await expect(findBin(readOnlyPath, { workingDir: join(root, 'project') })).resolves.toBeUndefined();
    await expect(findBin(join(root, 'missing'), { workingDir: join(root, 'project') })).resolves.toBeUndefined();
  });

  it('throws if the name is not a string', async () => {
    await expect(findBin(123 as unknown as string)).rejects.toThrow(/^Command name must be a string$/);
  });

  it('throws if the name is empty', async () => {
    await expect(findBin('')).rejects.toThrow(/^Command name must not be empty$/);
    await expect(findBin('  ')).rejects.toThrow(/^Command name must not be empty$/);
  });
});
