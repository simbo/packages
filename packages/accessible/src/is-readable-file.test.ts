import { describe, expect, it, vi } from 'vitest';

import { isReadableFile } from './is-readable-file.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isReadableFile', () => {
  it('returns true for a readable file', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isReadableFile('/some/readable-file')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'r', '/some/readable-file');
  });

  it('returns false if path is not a readable file', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isReadableFile('/some/non-readable-file')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'r', '/some/non-readable-file');
  });
});
