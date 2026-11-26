import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { afterEach, expect, test, vi } from 'vitest';

import { prepareRelease } from './publish-release.js';

const execFileAsync = promisify(execFile);
const TAG = '@simbo/example/v1.2.3';
const ASSET = 'simbo-example-1.2.3.tgz';

/**
 * @type {string[]}
 */
const directories = [];
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    directories.splice(0).map(async directory => {
      await rm(directory, { recursive: true, force: true });
    }),
  );
});

/**
 * Replaces GitHub reads with a controlled release and a real local tar archive.
 * Calls are recorded to prove preparation never invokes a publish command.
 *
 * @param {Record<string, unknown>} [releaseOverrides] - Release fields to invalidate.
 * @param {Record<string, unknown>} [manifestOverrides] - Packed manifest fields to invalidate.
 * @returns {Promise<{directory: string, calls: string[][], run: (command: string, args: string[]) => Promise<string>}>} Isolated runner fixture.
 */
async function fixture(releaseOverrides, manifestOverrides) {
  const directory = await mkdtemp(join(tmpdir(), 'publish-release-'));
  directories.push(directory);
  const manifest = { name: '@simbo/example', version: '1.2.3', ...manifestOverrides };
  /**
   * @type {string[][]}
   */
  const calls = [];
  return {
    directory,
    calls,
    async run(command, args) {
      calls.push([command, ...args]);
      expect(command).toBe('gh');
      if (args[0] === 'api') {
        return JSON.stringify({ tag_name: TAG, draft: false, prerelease: false, ...releaseOverrides });
      }
      expect(args.slice(0, 3)).toEqual(['release', 'download', TAG]);
      await mkdir(join(directory, 'package'));
      await writeFile(join(directory, 'package/package.json'), JSON.stringify(manifest));
      await execFileAsync('tar', ['-czf', join(directory, ASSET), '-C', directory, 'package']);
      const digest = createHash('sha256')
        .update(await readFile(join(directory, ASSET)))
        .digest('hex');
      await writeFile(join(directory, 'SHA256SUMS'), `${digest}  ${ASSET}\n`);
      return '';
    },
  };
}

test('prepares the tagged identity without consulting a checkout or invoking pnpm', async () => {
  // Assert the expected success message instead of printing fixture details.
  const output = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
  const { directory, calls, run } = await fixture();
  const metadata = await prepareRelease(TAG, directory, run);
  expect(metadata).toMatchObject({ name: '@simbo/example', asset: ASSET, private: false });
  expect(output).toHaveBeenCalledExactlyOnceWith(
    expect.stringMatching(/^✅ Verified @simbo\/example@1\.2\.3: simbo-example-1\.2\.3\.tgz \([a-f\d]{64}\)\n$/),
  );
  expect(calls.length).toBe(2);
  expect(calls[0]?.[2]?.endsWith('%40simbo%2Fexample%2Fv1.2.3')).toBeTruthy();
  expect(calls[1]).toContain(ASSET);
});

test('rejects drafts, prereleases and a response for another tag before downloading', async () => {
  for (const release of [{ draft: true }, { prerelease: true }, { tag_name: 'other/v1.2.3' }]) {
    const { directory, calls, run } = await fixture(release);
    await expect(prepareRelease(TAG, directory, run)).rejects.toThrow(/published stable/);
    expect(calls.length).toBe(1);
  }
});

test('reports private archives and rejects archives of another version', async () => {
  vi.spyOn(process.stdout, 'write').mockReturnValue(true);
  const privateRelease = await fixture(undefined, { private: true });
  expect(await prepareRelease(TAG, privateRelease.directory, privateRelease.run)).toMatchObject({ private: true });
  const otherVersion = await fixture(undefined, { version: '9.0.0' });
  await expect(prepareRelease(TAG, otherVersion.directory, otherVersion.run)).rejects.toThrow(
    /Archive identity mismatch/,
  );
});

test('rejects a damaged download without ever invoking a registry command', async () => {
  const { directory, calls, run } = await fixture();
  await expect(
    prepareRelease(TAG, directory, async (command, args) => {
      const output = await run(command, args);
      if (args[0] === 'release') await writeFile(join(directory, ASSET), 'damaged');
      return output;
    }),
  ).rejects.toThrow(/Checksum mismatch/);
  expect(calls.every(call => call[0] === 'gh')).toBeTruthy();
});

test('non-interactive CLI refuses publishing before any network or registry operation', async () => {
  await expect(
    execFileAsync(process.execPath, ['scripts/publish-release.js', TAG], { encoding: 'utf8' }),
  ).rejects.toThrow(/requires an interactive terminal/);
});
