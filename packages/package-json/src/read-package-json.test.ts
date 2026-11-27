import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { readPackageJson } from './read-package-json.js';

describe('readPackageJson()', () => {
  let dir: string;

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'package-json-read-'));
    dir = await realpath(tempDir);
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('reads the package.json in a directory', async () => {
    await writeFile(join(dir, 'package.json'), '{ "name": "pkg", "version": "1.0.0" }\n');

    expect(await readPackageJson(dir)).toEqual({ name: 'pkg', version: '1.0.0' });
  });

  it('reads the package.json at a file path', async () => {
    await writeFile(join(dir, 'package.json'), '{ "name": "pkg" }\n');

    expect(await readPackageJson(join(dir, 'package.json'))).toEqual({ name: 'pkg' });
  });

  it('does not normalize the content', async () => {
    await writeFile(join(dir, 'package.json'), '{ "name": " pkg ", "repository": "user/repo" }\n');

    expect(await readPackageJson(dir)).toEqual({ name: ' pkg ', repository: 'user/repo' });
  });

  it('rejects a missing file', async () => {
    const rejection = await readPackageJson(dir).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(Error);
    expect((rejection as Error).message).toMatch(/^Failed to read package\.json: .*ENOENT/);
    expect((rejection as Error).cause).toHaveProperty('code', 'ENOENT');
  });

  it('rejects invalid JSON', async () => {
    await writeFile(join(dir, 'package.json'), 'invalid json');

    await expect(readPackageJson(dir)).rejects.toThrow(/^Failed to read package\.json: Unexpected token/);
  });
});
