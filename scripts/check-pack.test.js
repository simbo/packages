import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach, expect, test } from 'vitest';

import { checkPack, findMissingFiles } from './check-pack.js';

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
 * Creates a temporary package outside the repository.
 *
 * @param {Record<string, unknown>} manifest - Manifest of the package.
 * @param {string[]} files - Files to create, relative to the package root.
 * @returns {Promise<string>} Package directory.
 */
async function fixture(manifest, files) {
  const directory = await mkdtemp(join(tmpdir(), 'check-pack-test-'));
  directories.push(directory);
  await writeFile(join(directory, 'package.json'), JSON.stringify(manifest));
  for (const file of files) {
    await mkdir(dirname(join(directory, file)), { recursive: true });
    await writeFile(join(directory, file), '');
  }
  return directory;
}

const example = {
  name: '@simbo/example',
  version: '1.2.3',
  type: 'module',
  exports: { '.': './dist/index.js', './utils': { import: './dist/utils.js', default: null } },
  bin: { example: 'dist/cli.js' },
  files: ['dist'],
};

test('accepts an archive with every promised file', async () => {
  const directory = await fixture(example, [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/utils.js',
    'dist/utils.d.ts',
    'dist/cli.js',
  ]);
  await expect(checkPack(directory)).resolves.toEqual({ name: '@simbo/example', files: 6 });
});

test('reports files missing from the archive', async () => {
  const directory = await fixture(example, ['dist/index.js', 'dist/index.d.ts', 'dist/utils.js']);
  await expect(checkPack(directory)).rejects.toThrow(
    'The archive of @simbo/example misses files:\ndist/cli.js is not in the archive.\ndist/utils.d.ts is not in the archive.',
  );
});

test('reports exported files that the files field leaves out', async () => {
  const directory = await fixture({ ...example, bin: undefined, files: ['dist/index.*'] }, [
    'dist/index.js',
    'dist/index.d.ts',
    'dist/utils.js',
    'dist/utils.d.ts',
  ]);
  await expect(checkPack(directory)).rejects.toThrow('dist/utils.js is not in the archive.');
});

test('skips private workspaces', async () => {
  const directory = await fixture({ name: 'private-example', version: '1.0.0', private: true }, []);
  await expect(checkPack(directory)).resolves.toBeUndefined();
});

test('requires declarations only if the archive ships some', () => {
  expect(findMissingFiles({ exports: './index.js' }, ['package.json', 'index.js'])).toEqual([]);
  expect(findMissingFiles({ exports: './index.js' }, ['index.js', 'other.d.ts'])).toEqual([
    'index.d.ts is not in the archive.',
  ]);
});

test('matches subpath patterns against the archive files', () => {
  const exports = { './configs/*': './configs/*.json' };
  expect(findMissingFiles({ exports }, ['configs/node.json'])).toEqual([]);
  expect(findMissingFiles({ exports }, ['configs/README.md'])).toEqual(['configs/*.json is not in the archive.']);
});
