import { describe, expect, it, vi } from 'vitest';

import { getWorkspacePatterns } from './get-workspace-patterns.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

// Bundlers like Rollup with @rollup/plugin-commonjs may expose a CommonJS
// package only as a default export.
vi.mock('yaml', async () => {
  const actual = await vi.importActual<typeof import('yaml')>('yaml');
  return {
    default: { parse: vi.fn().mockImplementation(actual.parse) },
  };
});

vi.mock('@simbo/accessible', () => ({
  isReadableFile: vi.fn().mockResolvedValue(true),
}));

const { readFile } = vi.mocked(await import('node:fs/promises'));

describe('getWorkspacePatterns with a default-only yaml export', () => {
  it('should return an array of workspace patterns from pnpm-workspace.yaml', async () => {
    readFile.mockResolvedValueOnce('packages:\n  - packages/*\n  - tools/*\n');

    const patterns = await getWorkspacePatterns();

    expect(patterns).toEqual(['packages/*', 'tools/*']);
    expect(readFile).toHaveBeenCalledWith('/cwd/pnpm-workspace.yaml', 'utf8');
  });
});
