import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { writePackageJson } from './write-package-json.js';

describe('writePackageJson()', () => {
  let dir: string;
  let file: string;

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'package-json-write-'));
    dir = await realpath(tempDir);
    file = join(dir, 'package.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('writes a new file with two spaces and a trailing newline', async () => {
    await writePackageJson(dir, { name: 'pkg', files: ['dist'] });

    expect(await readFile(file, 'utf8')).toBe('{\n  "name": "pkg",\n  "files": [\n    "dist"\n  ]\n}\n');
  });

  it('writes a new file with the given indentation', async () => {
    await writePackageJson(file, { name: 'pkg' }, { indent: '\t' });

    expect(await readFile(file, 'utf8')).toBe('{\n\t"name": "pkg"\n}\n');
  });

  it('creates missing directories', async () => {
    await writePackageJson(join(dir, 'a', 'b'), { name: 'pkg' });

    expect(await readFile(join(dir, 'a', 'b', 'package.json'), 'utf8')).toBe('{\n  "name": "pkg"\n}\n');
  });

  it('keeps the indentation of an existing file', async () => {
    await writeFile(file, '{\n    "name": "old"\n}\n');

    await writePackageJson(dir, { name: 'pkg' }, { indent: '\t' });

    expect(await readFile(file, 'utf8')).toBe('{\n    "name": "pkg"\n}\n');
  });

  it('keeps tabs of an existing file', async () => {
    await writeFile(file, '{\n\t"name": "old"\n}\n');

    await writePackageJson(dir, { name: 'pkg' });

    expect(await readFile(file, 'utf8')).toBe('{\n\t"name": "pkg"\n}\n');
  });

  it('keeps a missing trailing newline of an existing file', async () => {
    await writeFile(file, '{\n  "name": "old"\n}');

    await writePackageJson(dir, { name: 'pkg' });

    expect(await readFile(file, 'utf8')).toBe('{\n  "name": "pkg"\n}');
  });

  it('removes empty dependency objects and sorts dependencies', async () => {
    await writePackageJson(dir, { name: 'pkg', dependencies: { b: '1', a: '1' }, devDependencies: {} });

    expect(await readFile(file, 'utf8')).toBe(
      '{\n  "name": "pkg",\n  "dependencies": {\n    "a": "1",\n    "b": "1"\n  }\n}\n',
    );
  });

  it('keeps the key order without sort', async () => {
    await writePackageJson(dir, { version: '1.0.0', name: 'pkg' });

    expect(await readFile(file, 'utf8')).toBe('{\n  "version": "1.0.0",\n  "name": "pkg"\n}\n');
  });

  it('sorts keys with sort', async () => {
    await writePackageJson(dir, { scripts: { test: 't', build: 'b' }, version: '1.0.0', name: 'pkg' }, { sort: true });

    expect(await readFile(file, 'utf8')).toBe(
      '{\n  "name": "pkg",\n  "version": "1.0.0",\n  "scripts": {\n    "build": "b",\n    "test": "t"\n  }\n}\n',
    );
  });

  it('sorts keys in a given order', async () => {
    await writePackageJson(dir, { name: 'pkg', version: '1.0.0' }, { sort: { sortOrder: ['version'] } });

    expect(await readFile(file, 'utf8')).toBe('{\n  "version": "1.0.0",\n  "name": "pkg"\n}\n');
  });

  it('rejects a path that cannot be written', async () => {
    await mkdir(file);

    await expect(writePackageJson(dir, { name: 'pkg' })).rejects.toThrow(/^Failed to write package\.json: /);
  });
});
