import type { GlobbyStream } from 'globby';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { globbyHasMatches } from './globby-has-matches.js';

vi.mock('globby', () => ({
  globbyStream: vi.fn(),
}));

const { globbyStream } = vi.mocked(await import('globby'));

const createMockStream = (values: unknown[]): GlobbyStream =>
  ({
    *[Symbol.asyncIterator]() {
      for (const value of values) {
        yield value;
      }
    },
  }) as unknown as GlobbyStream;

describe('globbyHasMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true if at least one file matches (no matcher)', async () => {
    globbyStream.mockReturnValue(createMockStream(['file-a.js', 'file-b.js']));

    const result = await globbyHasMatches('**/*.js');
    expect(result).toBe(true);
  });

  it('returns false if no files match', async () => {
    globbyStream.mockReturnValue(createMockStream([]));

    const result = await globbyHasMatches('**/*.ts');
    expect(result).toBe(false);
  });

  it('returns true if a matcher accepts one file', async () => {
    globbyStream.mockReturnValue(createMockStream(['file-a.js', 'file-b.js']));

    const result = await globbyHasMatches('**/*.js', {
      matcher: path => path.endsWith('b.js'),
    });

    expect(result).toBe(true);
  });

  it('returns false if matcher rejects all files', async () => {
    globbyStream.mockReturnValue(createMockStream(['file-a.js', 'file-b.js']));

    const result = await globbyHasMatches('**/*.js', {
      matcher: () => false,
    });

    expect(result).toBe(false);
  });

  it('supports async matchers', async () => {
    globbyStream.mockReturnValue(createMockStream(['file-a.js', 'file-b.js']));

    const result = await globbyHasMatches('**/*.js', {
      matcher: async path =>
        new Promise(resolve =>
          globalThis.setTimeout(() => {
            resolve(path === 'file-a.js');
          }, 1),
        ),
    });

    expect(result).toBe(true);
  });

  it('handles non-string stream output (defensively)', async () => {
    globbyStream.mockReturnValue(createMockStream([123, true, null]));

    const result = await globbyHasMatches('**/*');
    expect(result).toBe(true); // fallback is `String(data).length > 0`
  });
});
