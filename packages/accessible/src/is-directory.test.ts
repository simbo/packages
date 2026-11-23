import { describe, expect, it, vi } from 'vitest';

import { isDirectory } from './is-directory.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isDirectory', () => {
  it('returns true for a directory', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isDirectory('/some/dir')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', '', '/some/dir');
  });

  it('returns false if path is not a directory', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isDirectory('/some/file')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', '', '/some/file');
  });
});
