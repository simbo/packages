import { describe, expect, it, vi } from 'vitest';

import { isFile } from './is-file.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isFile', () => {
  it('returns true for a file', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isFile('/some/file')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', '', '/some/file');
  });

  it('returns false if path is not a file', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isFile('/some/directory')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', '', '/some/directory');
  });
});
