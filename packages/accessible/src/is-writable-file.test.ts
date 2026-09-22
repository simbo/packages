import { describe, expect, it, vi } from 'vitest';

import { isWritableFile } from './is-writable-file.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isWritableFile', () => {
  it('returns true for a writable file', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isWritableFile('/some/writable-file')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'w', '/some/writable-file');
  });

  it('returns false if path is not a writable file', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isWritableFile('/some/non-writable-file')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'w', '/some/non-writable-file');
  });
});
