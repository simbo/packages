import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { findBin } from './find-bin.js';

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('@simbo/accessible', () => ({
  isExecutableFile: vi.fn().mockResolvedValue(true),
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
}));

vi.mock('find-up', () => ({
  findUp: vi.fn().mockImplementation(async (fn: (path: string) => Promise<string | undefined>) => fn('/find-up-path')),
}));

const { cwd } = vi.mocked(await import('node:process'));
const { isExecutableFile } = vi.mocked(await import('@simbo/accessible'));
const { execa } = vi.mocked(await import('execa'));
const { findUp } = vi.mocked(await import('find-up'));

describe('findBin', () => {
  let executor: Mock;

  beforeEach(() => {
    executor = vi.fn();
    (execa as Mock).mockReturnValue(executor);
  });

  it('should find a local binary in a node_modules folder up the path', async () => {
    const result = await findBin('test-bin');

    expect(result).toEqual('/find-up-path/node_modules/.bin/test-bin');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenNthCalledWith(1, expect.any(Function), { cwd: '/cwd' });
    expect(isExecutableFile).toHaveBeenCalledTimes(1);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/find-up-path/node_modules/.bin/test-bin');
    expect(execa).not.toHaveBeenCalled();
  });

  it('should look for a global binary path using which', async () => {
    executor.mockResolvedValueOnce({ stdout: '/path/to/test-bin' });
    isExecutableFile.mockResolvedValueOnce(false);
    const result = await findBin('test-bin');

    expect(result).toEqual('/path/to/test-bin');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenNthCalledWith(1, expect.any(Function), { cwd: '/cwd' });
    expect(isExecutableFile).toHaveBeenCalledTimes(2);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/find-up-path/node_modules/.bin/test-bin');
    expect(isExecutableFile).toHaveBeenNthCalledWith(2, '/path/to/test-bin');
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['which ', ''], 'test-bin');
  });

  it('should return undefined if the binary is not found', async () => {
    executor.mockResolvedValueOnce({ stdout: '/path/to/test-bin' });
    isExecutableFile.mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    const result = await findBin('test-bin');

    expect(result).toBeUndefined();
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenNthCalledWith(1, expect.any(Function), { cwd: '/cwd' });
    expect(isExecutableFile).toHaveBeenCalledTimes(2);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/find-up-path/node_modules/.bin/test-bin');
    expect(isExecutableFile).toHaveBeenNthCalledWith(2, '/path/to/test-bin');
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['which ', ''], 'test-bin');
  });

  it('should return undefined if the which call fails', async () => {
    executor.mockRejectedValueOnce(new Error('Command not found'));
    isExecutableFile.mockResolvedValueOnce(false);
    const result = await findBin('test-bin');

    expect(result).toBeUndefined();
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenCalledTimes(1);
    expect(findUp).toHaveBeenNthCalledWith(1, expect.any(Function), { cwd: '/cwd' });
    expect(isExecutableFile).toHaveBeenCalledTimes(1);
    expect(isExecutableFile).toHaveBeenNthCalledWith(1, '/find-up-path/node_modules/.bin/test-bin');
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['which ', ''], 'test-bin');
  });

  it('should throw if the command name is not a string', async () => {
    await expect(findBin(123 as unknown as string)).rejects.toThrow(/^Command name must be a string$/);

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).not.toHaveBeenCalled();
    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(execa).not.toHaveBeenCalled();
  });

  it('should throw if the command name an empty string', async () => {
    await expect(findBin('')).rejects.toThrow(/^Command name must not be empty$/);

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(findUp).not.toHaveBeenCalled();
    expect(isExecutableFile).not.toHaveBeenCalled();
    expect(execa).not.toHaveBeenCalled();
  });
});
