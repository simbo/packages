import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { updatePackageJson } from './update-package-json.js';

describe('updatePackageJson()', () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'package-json-update-'));
    dir = await realpath(tempDir);
    file = join(dir, 'package.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes the object changed by the updater', async () => {
    await writeFile(file, '{\n  "name": "pkg",\n  "private": true,\n  "version": "1.0.0"\n}\n');

    await updatePackageJson(dir, packageJson => {
      packageJson.version = '2.0.0';
      delete packageJson.private;
    });

    expect(await readFile(file, 'utf8')).toBe('{\n  "name": "pkg",\n  "version": "2.0.0"\n}\n');
  });

  it('writes the object returned by the updater', async () => {
    await writeFile(file, '{\n  "name": "pkg",\n  "files": ["dist"]\n}\n');

    await updatePackageJson(file, async () => {
      await Promise.resolve();
      return { name: 'renamed', files: ['dist', 'src'] };
    });

    expect(await readFile(file, 'utf8')).toBe(
      '{\n  "name": "renamed",\n  "files": [\n    "dist",\n    "src"\n  ]\n}\n',
    );
  });

  it('keeps the indentation and sorts with sort', async () => {
    await writeFile(file, '{\n\t"version": "1.0.0",\n\t"name": "pkg"\n}');

    await updatePackageJson(dir, () => {}, { sort: true });

    expect(await readFile(file, 'utf8')).toBe('{\n\t"name": "pkg",\n\t"version": "1.0.0"\n}');
  });

  it('rejects a missing file without creating it', async () => {
    await expect(updatePackageJson(dir, packageJson => packageJson)).rejects.toThrow(/^Failed to read package\.json: /);
    await expect(readFile(file, 'utf8')).rejects.toHaveProperty('code', 'ENOENT');
  });

  it('rejects with the error of the updater', async () => {
    await writeFile(file, '{ "name": "pkg" }\n');
    const error = new Error('updater failed');

    await expect(
      updatePackageJson(dir, () => {
        throw error;
      }),
    ).rejects.toBe(error);
    expect(await readFile(file, 'utf8')).toBe('{ "name": "pkg" }\n');
  });
});
