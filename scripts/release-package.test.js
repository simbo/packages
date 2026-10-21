import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { parseTag, readMetadata, verifyArchive } from './release-package.js';

/**
 * @type {string[]}
 */
const directories = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

/**
 * Creates a temporary repository with a configurable source manifest.
 * Cleanup is registered centrally so failed assertions leave no fixtures behind.
 *
 * @param {Record<string, unknown>} [manifest] - Source manifest; defaults to the valid example identity.
 * @returns {string} Temporary repository root.
 */
function fixture(manifest) {
  const directory = mkdtempSync(join(tmpdir(), 'package-release-'));
  directories.push(directory);
  mkdirSync(join(directory, 'packages/example'), { recursive: true });
  writeFileSync(
    join(directory, 'packages/example/package.json'),
    JSON.stringify(manifest ?? { name: '@simbo/example', version: '1.2.3' }),
  );
  return directory;
}

/**
 * Builds a real tar archive and matching checksum for verification scenarios.
 * The packed manifest can differ from the source manifest to test mismatches.
 *
 * @param {string} directory - Fixture root in which to write the archive and digest.
 * @param {Record<string, unknown>} [manifest] - Manifest to embed in the archive.
 * @returns {void} Writes the fixture files for the caller's assertions.
 */
function archive(directory, manifest) {
  mkdirSync(join(directory, 'package'));
  writeFileSync(
    join(directory, 'package/package.json'),
    JSON.stringify(manifest ?? { name: '@simbo/example', version: '1.2.3' }),
  );
  execFileSync('tar', ['-czf', join(directory, 'example-1.2.3.tgz'), '-C', directory, 'package']);
  const digest = createHash('sha256')
    .update(readFileSync(join(directory, 'example-1.2.3.tgz')))
    .digest('hex');
  writeFileSync(join(directory, 'SHA256SUMS'), `${digest}  example-1.2.3.tgz\n`);
}

test('stable tags preserve workspace identity independently of the npm scope', () => {
  expect(parseTag('example/v1.2.3')).toEqual({
    tag: 'example/v1.2.3',
    workspace: 'example',
    version: '1.2.3',
    asset: 'example-1.2.3.tgz',
  });
  expect(readMetadata('example/v1.2.3', fixture()).name).toBe('@simbo/example');
});

test('rejects paths, malformed versions, prereleases and the changelog workspace', () => {
  for (const tag of [
    '../example/v1.2.3',
    'example/v1.2',
    'example/v01.2.3',
    'example/v1.2.3-beta.1',
    'changelog/v1.2.3',
    'example/v1.2.3\n',
  ]) {
    expect(() => parseTag(tag)).toThrow(/Invalid package tag/);
  }
});

test('requires the tagged manifest version to match the requested release', () => {
  const directory = fixture({ name: '@simbo/example', version: '1.2.4' });
  expect(() => readMetadata('example/v1.2.3', directory)).toThrow(/Version mismatch/);
});

test('rejects invalid manifest names before writing workflow outputs', () => {
  const directory = fixture({ name: 'bad\nname', version: '1.2.3' });
  expect(() => readMetadata('example/v1.2.3', directory)).toThrow(/Invalid package name/);
  expect(() => readMetadata('example/v1.2.3', fixture({ version: '1.2.3' }))).toThrow(/Invalid package name/);
});

test('accepts the unchanged archive and its single-file SHA-256 checksum', () => {
  const directory = fixture();
  archive(directory);
  verifyArchive(readMetadata('example/v1.2.3', directory), directory);
});

test('rejects modified archives and checksum manifests naming other paths', () => {
  const directory = fixture();
  archive(directory);
  const metadata = readMetadata('example/v1.2.3', directory);
  writeFileSync(join(directory, 'example-1.2.3.tgz'), 'modified bytes');
  expect(() => {
    verifyArchive(metadata, directory);
  }).toThrow(/Checksum mismatch/);
  writeFileSync(join(directory, 'SHA256SUMS'), `${'0'.repeat(64)}  ../../other.tgz\n`);
  expect(() => {
    verifyArchive(metadata, directory);
  }).toThrow(/Checksum mismatch/);
});

test('rejects checksum-valid archives for another package or version', () => {
  for (const manifest of [
    { name: 'other', version: '1.2.3' },
    { name: '@simbo/example', version: '9.0.0' },
  ]) {
    const directory = fixture();
    archive(directory, manifest);
    expect(() => {
      verifyArchive(readMetadata('example/v1.2.3', directory), directory);
    }).toThrow(/Archive identity mismatch/);
  }
});

test('rejects private archives and unresolved workspace dependencies', () => {
  for (const extra of [{ private: true }, { dependencies: { other: 'workspace:*' } }]) {
    const directory = fixture();
    archive(directory, { name: '@simbo/example', version: '1.2.3', ...extra });
    expect(() => {
      verifyArchive(readMetadata('example/v1.2.3', directory), directory);
    }).toThrow(/Private packages|Unresolved workspace/);
  }
});
