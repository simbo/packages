import { describe, expect, it, vi } from 'vitest';

import { isWritableDirectory } from './is-writable-directory.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isWritableDirectory', () => {
  it('returns true for a writable directory', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isWritableDirectory('/some/writable-dir')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'w', '/some/writable-dir');
  });

  it('returns false if path is not a writable directory', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isWritableDirectory('/some/non-writable-dir')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'w', '/some/non-writable-dir');
  });
});
