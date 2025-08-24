import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { callPrettier } from './call-prettier.js';

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('@simbo/accessible', () => ({
  isExecutableFile: vi.fn().mockResolvedValue(true),
}));

vi.mock('@simbo/find-bin', () => ({
  findBin: vi.fn().mockResolvedValue('/cwd/node_modules/.bin/prettier'),
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

const { isExecutableFile } = vi.mocked(await import('@simbo/accessible'));
const { findBin } = vi.mocked(await import('@simbo/find-bin'));
const { execa } = vi.mocked(await import('execa'));

describe('callPrettier', () => {
  let executor: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    executor = vi.fn();
    (execa as Mock).mockReturnValue(executor);
  });

  it('should call Prettier with the correct arguments', async () => {
    await callPrettier('*.js');

    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(findBin).toHaveBeenCalledTimes(1);
    expect(findBin).toHaveBeenNthCalledWith(1, 'prettier', { workingDir: '/cwd' });
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, '/cwd/node_modules/.bin/prettier', ['--write', '*.js']);
  });

  it('should disable ignores when specified', async () => {
    await callPrettier('*.js', { disableIgnores: true });

    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(findBin).toHaveBeenCalledTimes(1);
    expect(findBin).toHaveBeenNthCalledWith(1, 'prettier', { workingDir: '/cwd' });
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, '/cwd/node_modules/.bin/prettier', [
      "--ignore-path ''",
      '--write',
      '*.js',
    ]);
  });

  it('should support setting a custom Prettier binary path', async () => {
    await callPrettier('*.js', { binPath: '/custom/path/to/prettier' });

    expect(isExecutableFile).toHaveBeenCalledTimes(1);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/custom/path/to/prettier');
    expect(findBin).not.toHaveBeenCalled();
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, '/custom/path/to/prettier', ['--write', '*.js']);
  });

  it('should throw if the Prettier binary is not found', async () => {
    findBin.mockResolvedValueOnce(undefined);

    await expect(callPrettier('*.js')).rejects.toThrow('Could not determine Prettier binary path.');

    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(findBin).toHaveBeenCalledTimes(1);
    expect(findBin).toHaveBeenNthCalledWith(1, 'prettier', { workingDir: '/cwd' });
    expect(execa).not.toHaveBeenCalled();
    expect(executor).not.toHaveBeenCalled();
  });

  it('should throw if the custom binary path does not lead to a executable', async () => {
    isExecutableFile.mockResolvedValueOnce(false);

    await expect(callPrettier('*.js', { binPath: '/custom/path/to/prettier' })).rejects.toThrowError(
      "The provided prettier binary path '/custom/path/to/prettier' is not executable.",
    );

    expect(isExecutableFile).toHaveBeenCalledTimes(1);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/custom/path/to/prettier');
    expect(findBin).not.toHaveBeenCalled();
    expect(execa).not.toHaveBeenCalled();
    expect(executor).not.toHaveBeenCalled();
  });

  it('should throw if mode option is not "write" or "check"', async () => {
    await expect(callPrettier('*.js', { mode: 'invalid' as string as 'write' })).rejects.toThrowError(
      "Invalid mode 'invalid'. Expected 'write' or 'check'.",
    );

    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(findBin).not.toHaveBeenCalled();
    expect(execa).not.toHaveBeenCalled();
    expect(executor).not.toHaveBeenCalled();
  });

  it('should not throw if Prettier binary is not found and throwIfNotFound is false', async () => {
    findBin.mockResolvedValueOnce(undefined);

    await expect(callPrettier('*.js', { throwIfNotFound: false })).resolves.toBeUndefined();
    expect(isExecutableFile).not.toHaveBeenCalled();

    expect(findBin).toHaveBeenCalledTimes(1);
    expect(findBin).toHaveBeenNthCalledWith(1, 'prettier', { workingDir: '/cwd' });
    expect(execa).not.toHaveBeenCalled();
    expect(executor).not.toHaveBeenCalled();
  });

  it('should not throw if custom binary path does not lead to an executable if throwIfNotFound is false', async () => {
    isExecutableFile.mockResolvedValueOnce(false);

    await expect(
      callPrettier('*.js', { binPath: '/custom/path/to/prettier', throwIfNotFound: false }),
    ).resolves.toBeUndefined();

    expect(isExecutableFile).toHaveBeenCalledTimes(1);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/custom/path/to/prettier');
    expect(findBin).not.toHaveBeenCalled();
    expect(execa).not.toHaveBeenCalled();
    expect(executor).not.toHaveBeenCalled();
  });
});
