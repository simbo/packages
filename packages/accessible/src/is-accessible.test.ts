import type { Stats } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import { isAccessible } from './is-accessible.js';

vi.mock('node:fs/promises', () => ({
  stat: vi.fn(),
  access: vi.fn(),
  constants: { R_OK: 4, W_OK: 2, X_OK: 1 },
}));

const { stat, access, constants } = vi.mocked(await import('node:fs/promises'));

const mockStats = {
  file: { isFile: () => true, isDirectory: () => false } as Stats,
  directory: { isFile: () => false, isDirectory: () => true } as Stats,
};

describe('isAccessible', () => {
  it('returns false if stat throws', async () => {
    stat.mockRejectedValueOnce(new Error('ENOENT'));
    expect(await isAccessible('file', '', '/missing')).toBe(false);
  });

  it('returns false if path is not of requested type', async () => {
    stat.mockResolvedValue(mockStats.directory);
    expect(await isAccessible('file', '', '/path')).toBe(false);

    stat.mockResolvedValue(mockStats.file);
    expect(await isAccessible('directory', '', '/path')).toBe(false);
  });

  it('returns true when type matches and no mode check is required', async () => {
    stat.mockResolvedValue(mockStats.file);
    expect(await isAccessible('file', '', '/file')).toBe(true);
    expect(access).not.toHaveBeenCalled();
  });

  it('returns true when all requested modes succeed', async () => {
    stat.mockResolvedValue(mockStats.file);
    access.mockResolvedValue(undefined);

    expect(await isAccessible('file', 'rw', '/file')).toBe(true);
    expect(access).toHaveBeenCalledWith('/file', constants.R_OK);
    expect(access).toHaveBeenCalledWith('/file', constants.W_OK);
  });

  it('returns false if any requested mode fails', async () => {
    stat.mockResolvedValue(mockStats.file);
    access
      .mockResolvedValueOnce(undefined) // R_OK
      .mockRejectedValueOnce(new Error('EACCES')); // W_OK

    expect(await isAccessible('file', 'rw', '/file')).toBe(false);
  });

  it('ignores unknown characters in mode string', async () => {
    stat.mockResolvedValue(mockStats.file);
    access.mockResolvedValue(undefined);

    expect(await isAccessible('file', 'rxz?', '/file')).toBe(true);
    expect(access).toHaveBeenCalledTimes(2); // R_OK and X_OK only
  });

  it('returns true for executable if accessible', async () => {
    stat.mockResolvedValue(mockStats.file);
    access.mockResolvedValue(undefined);

    expect(await isAccessible('file', 'x', '/file')).toBe(true);
    expect(access).toHaveBeenCalledWith('/file', constants.X_OK);
  });

  it('returns false when access fails even for single valid flag', async () => {
    stat.mockResolvedValue(mockStats.file);
    access.mockRejectedValue(new Error('EACCES'));

    expect(await isAccessible('file', 'r', '/file')).toBe(false);
  });
});
