import { describe, expect, it, vi } from 'vitest';

import { isExecutableDirectory } from './is-executable-directory.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isExecutableDirectory', () => {
  it('returns true for an executable directory', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isExecutableDirectory('/some/executable')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'x', '/some/executable');
  });

  it('returns false if path is not an executable directory', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isExecutableDirectory('/some/document')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('directory', 'x', '/some/document');
  });
});
