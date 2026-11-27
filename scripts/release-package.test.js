import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { afterEach, expect, test, vi } from 'vitest';

import { assetName, parseTag, readMetadata, verifyArchive } from './release-package.js';

const execFileAsync = promisify(execFile);

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
 * Creates a temporary monorepo whose workspaces live in several folders.
 * Cleanup is registered centrally so failed assertions leave no fixtures behind.
 *
 * @returns {Promise<string>} Temporary repository root.
 */
async function fixture() {
  const directory = await mkdtemp(join(tmpdir(), 'package-release-'));
  directories.push(directory);
  await writeFile(join(directory, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - changelog\n');
  await mkdir(join(directory, 'packages/example'), { recursive: true });
  await mkdir(join(directory, 'changelog'));
  await writeFile(
    join(directory, 'packages/example/package.json'),
    JSON.stringify({ name: '@simbo/example', version: '1.2.3' }),
  );
  await writeFile(
    join(directory, 'changelog/package.json'),
    JSON.stringify({ name: 'packages-changelog', version: '2.0.0', private: true }),
  );
  return directory;
}

/**
 * Builds a real tar archive and matching checksum for verification scenarios.
 * The packed manifest can differ from the tag to test mismatches.
 *
 * @param {string} directory - Directory in which to write the archive and digest.
 * @param {Record<string, unknown>} [manifest] - Manifest to embed in the archive.
 * @returns {Promise<void>} Resolves once the fixture files are written.
 */
async function archive(directory, manifest) {
  const asset = 'simbo-example-1.2.3.tgz';
  await mkdir(join(directory, 'package'));
  await writeFile(
    join(directory, 'package/package.json'),
    JSON.stringify(manifest ?? { name: '@simbo/example', version: '1.2.3' }),
  );
  await execFileAsync('tar', ['-czf', join(directory, asset), '-C', directory, 'package']);
  const digest = createHash('sha256')
    .update(await readFile(join(directory, asset)))
    .digest('hex');
  await writeFile(join(directory, 'SHA256SUMS'), `${digest}  ${asset}\n`);
}

test('tags carry the full package name and name the asset like pnpm pack', () => {
  expect(parseTag('@simbo/example/v1.2.3')).toEqual({
    tag: '@simbo/example/v1.2.3',
    name: '@simbo/example',
    version: '1.2.3',
    asset: 'simbo-example-1.2.3.tgz',
  });
  expect(parseTag('packages-changelog/v1.8.0')).toMatchObject({
    name: 'packages-changelog',
    asset: 'packages-changelog-1.8.0.tgz',
  });
  expect(assetName('@simbo/eslint-config', '3.4.0')).toBe('simbo-eslint-config-3.4.0.tgz');
});

test('rejects paths, malformed names and versions, and prereleases', () => {
  for (const tag of [
    '../example/v1.2.3',
    '@simbo/../example/v1.2.3',
    '@simbo/example/nested/v1.2.3',
    '@/example/v1.2.3',
    'Example/v1.2.3',
    'example/v1.2',
    'example/v01.2.3',
    'example/v1.2.3-beta.1',
    'example/v1.2.3\n',
  ]) {
    expect(() => parseTag(tag)).toThrow(/Invalid package tag/);
  }
});

test('resolves the workspace by package name in any workspace folder', async () => {
  const directory = await fixture();
  expect(await readMetadata('@simbo/example/v1.2.3', directory)).toEqual({
    tag: '@simbo/example/v1.2.3',
    name: '@simbo/example',
    version: '1.2.3',
    asset: 'simbo-example-1.2.3.tgz',
    dir: 'packages/example',
    private: false,
  });
  expect(await readMetadata('packages-changelog/v2.0.0', directory)).toMatchObject({
    dir: 'changelog',
    private: true,
  });
});

test('rejects tags of unknown packages and mismatched versions', async () => {
  const directory = await fixture();
  await expect(readMetadata('@simbo/other/v1.2.3', directory)).rejects.toThrow(/not found/);
  await expect(readMetadata('@simbo/example/v1.2.4', directory)).rejects.toThrow(/Version mismatch/);
});

test('accepts the unchanged archive and reports whether it is private', async () => {
  // Capture expected success output while keeping production diagnostics intact.
  const output = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
  const directory = await fixture();
  await archive(directory);
  expect(await verifyArchive(parseTag('@simbo/example/v1.2.3'), directory)).toEqual({ private: false });
  expect(output).toHaveBeenCalledExactlyOnceWith(
    expect.stringMatching(/^✅ Verified @simbo\/example@1\.2\.3: simbo-example-1\.2\.3\.tgz \([a-f\d]{64}\)\n$/),
  );

  const privateDirectory = await fixture();
  await archive(privateDirectory, { name: '@simbo/example', version: '1.2.3', private: true });
  expect(await verifyArchive(parseTag('@simbo/example/v1.2.3'), privateDirectory)).toEqual({ private: true });
});

test('rejects modified archives and checksum manifests naming other paths', async () => {
  const directory = await fixture();
  await archive(directory);
  const metadata = parseTag('@simbo/example/v1.2.3');
  await writeFile(join(directory, 'simbo-example-1.2.3.tgz'), 'modified bytes');
  await expect(verifyArchive(metadata, directory)).rejects.toThrow(/Checksum mismatch/);
  await writeFile(join(directory, 'SHA256SUMS'), `${'0'.repeat(64)}  ../../other.tgz\n`);
  await expect(verifyArchive(metadata, directory)).rejects.toThrow(/Checksum mismatch/);
});

test('rejects checksum-valid archives for another package or version', async () => {
  for (const manifest of [
    { name: 'other', version: '1.2.3' },
    { name: '@simbo/example', version: '9.0.0' },
  ]) {
    const directory = await fixture();
    await archive(directory, manifest);
    await expect(verifyArchive(parseTag('@simbo/example/v1.2.3'), directory)).rejects.toThrow(
      /Archive identity mismatch/,
    );
  }
});

test('rejects unresolved workspace dependencies', async () => {
  const directory = await fixture();
  await archive(directory, { name: '@simbo/example', version: '1.2.3', dependencies: { other: 'workspace:*' } });
  await expect(verifyArchive(parseTag('@simbo/example/v1.2.3'), directory)).rejects.toThrow(/Unresolved workspace/);
});
