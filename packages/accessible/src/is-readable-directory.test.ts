import { describe, expect, it, vi } from 'vitest';

import { isReadableDirectory } from './is-readable-directory.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isReadableDirectory', () => {
  it('returns true for a readable directory', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isReadableDirectory('/some/readable-dir')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'r', '/some/readable-dir');
  });

  it('returns false if path is not a readable directory', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isReadableDirectory('/some/non-readable-dir')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'r', '/some/non-readable-dir');
  });
});
