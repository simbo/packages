import { describe, expect, it, vi } from 'vitest';

import { getWorkspacePaths } from './get-workspace-paths.js';

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    join: vi.fn().mockImplementation((...paths: string[]) => actual.join(...paths)),
  };
});

vi.mock('globby', () => ({
  globby: vi.fn(),
}));

vi.mock('./get-workspace-patterns.js', () => ({
  getWorkspacePatterns: vi.fn().mockResolvedValue(['packages/*']),
}));

const { cwd } = vi.mocked(await import('node:process'));
const { join } = vi.mocked(await import('node:path'));
const { globby } = vi.mocked(await import('globby'));
const { getWorkspacePatterns } = vi.mocked(await import('./get-workspace-patterns.js'));

describe('getWorkspacePaths', () => {
  it('should return an array of workspace paths', async () => {
    getWorkspacePatterns.mockResolvedValueOnce(['packages/*']);
    globby.mockResolvedValueOnce(['packages/pkg-a/package.json', 'packages/pkg-b/package.json']);
    const patterns = await getWorkspacePaths();

    expect(patterns).toEqual(['packages/pkg-a', 'packages/pkg-b']);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, 'packages/*', 'package.json');
    expect(getWorkspacePatterns).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).toHaveBeenCalledWith({ workingDir: '/cwd' });
    expect(globby).toHaveBeenCalledTimes(1);
    expect(globby).toHaveBeenCalledWith(['packages/*/package.json'], expect.any(Object));
  });

  it('should use the provided workspace patterns', async () => {
    globby.mockResolvedValueOnce(['apps/pkg-a/package.json', 'apps/pkg-b/package.json']);
    const patterns = await getWorkspacePaths({ patterns: ['apps/*'] });

    expect(patterns).toEqual(['apps/pkg-a', 'apps/pkg-b']);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).not.toHaveBeenCalled();
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, 'apps/*', 'package.json');
    expect(globby).toHaveBeenCalledTimes(1);
    expect(globby).toHaveBeenCalledWith(['apps/*/package.json'], expect.any(Object));
  });

  it('should return absolute paths if absolutePaths option is true', async () => {
    getWorkspacePatterns.mockResolvedValueOnce(['packages/*']);
    globby.mockResolvedValueOnce(['packages/pkg-a/package.json', 'packages/pkg-b/package.json']);
    const patterns = await getWorkspacePaths({ absolutePaths: true });

    expect(patterns).toEqual(['/cwd/packages/pkg-a', '/cwd/packages/pkg-b']);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).toHaveBeenCalledWith({ workingDir: '/cwd' });
    expect(join).toHaveBeenCalledTimes(3);
    expect(join).toHaveBeenNthCalledWith(1, 'packages/*', 'package.json');
    expect(join).toHaveBeenNthCalledWith(2, '/cwd', 'packages/pkg-a');
    expect(join).toHaveBeenNthCalledWith(3, '/cwd', 'packages/pkg-b');
    expect(globby).toHaveBeenCalledTimes(1);
    expect(globby).toHaveBeenCalledWith(['packages/*/package.json'], expect.any(Object));
  });

  it('should throw if globby found no package.json files', async () => {
    globby.mockResolvedValueOnce([]);

    await expect(getWorkspacePaths()).rejects.toThrow('No workspaces found.');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).toHaveBeenCalledTimes(1);
    expect(getWorkspacePatterns).toHaveBeenCalledWith({ workingDir: '/cwd' });
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, 'packages/*', 'package.json');
    expect(globby).toHaveBeenCalledTimes(1);
    expect(globby).toHaveBeenCalledWith(['packages/*/package.json'], expect.any(Object));
  });
});
