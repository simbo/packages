import { describe, expect, it, vi } from 'vitest';

import { isExecutableFile } from './is-executable-file.js';

vi.mock('./is-accessible.js', () => ({
  isAccessible: vi.fn(),
}));

const { isAccessible } = vi.mocked(await import('./is-accessible.js'));

describe('isExecutableFile', () => {
  it('returns true for an executable file', async () => {
    isAccessible.mockResolvedValueOnce(true);
    expect(await isExecutableFile('/some/executable')).toBe(true);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'x', '/some/executable');
  });

  it('returns false if path is not an executable file', async () => {
    isAccessible.mockResolvedValueOnce(false);
    expect(await isExecutableFile('/some/document')).toBe(false);
    expect(isAccessible).toHaveBeenCalledTimes(1);
    expect(isAccessible).toHaveBeenCalledWith('file', 'x', '/some/document');
  });
});
