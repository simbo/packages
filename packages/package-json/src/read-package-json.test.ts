import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readPackageJson } from './read-package-json.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    resolve: vi.fn().mockImplementation((...args: string[]) => actual.resolve(...args)),
    basename: vi.fn().mockImplementation((path: string) => actual.basename(path)),
  };
});

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

const { readFile } = vi.mocked(await import('node:fs/promises'));
const { resolve, basename } = vi.mocked(await import('node:path'));
const { cwd } = vi.mocked(await import('node:process'));

describe('readPackageJson', () => {
  let pkg: Record<string, unknown>;

  beforeEach(() => {
    pkg = { name: 'mocked-package' };
    readFile.mockResolvedValue(JSON.stringify(pkg));
  });

  it('returns the package.json object from the current working directory', async () => {
    const result = await readPackageJson();

    expect(result).toEqual(pkg);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(basename).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith('/cwd', 'package.json');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/cwd/package.json', 'utf8');
  });

  it('returns the package.json object from the given directory path', async () => {
    const result = await readPackageJson('/path/to');

    expect(result).toEqual(pkg);
    expect(cwd).not.toHaveBeenCalled();
    expect(basename).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith('/path/to', 'package.json');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/path/to/package.json', 'utf8');
  });

  it('returns the package.json object from the given file path', async () => {
    const result = await readPackageJson('/path/to/package.json');

    expect(result).toEqual(pkg);
    expect(cwd).not.toHaveBeenCalled();
    expect(basename).toHaveBeenCalledTimes(1);
    expect(resolve).not.toHaveBeenCalled();
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/path/to/package.json', 'utf8');
  });

  it('should throw an error if readFile fails', async () => {
    readFile.mockRejectedValue(new Error('readFile Error'));

    await expect(readPackageJson()).rejects.toThrow(/^Failed to read package.json: readFile Error/);
  });

  it('should throw an error if the package.json is invalid', async () => {
    readFile.mockResolvedValue('invalid json');

    await expect(readPackageJson()).rejects.toThrow(/^Failed to read package.json: Unexpected token/);
  });
});
