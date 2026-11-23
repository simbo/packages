import { describe, expect, it, vi } from 'vitest';

import { isGitRepositoryRoot } from './is-git-repository-root.js';

vi.mock('node:process', () => ({
  cwd: vi.fn(() => '/working/directory'),
}));

vi.mock('@simbo/accessible', () => ({
  isDirectory: vi.fn(),
}));

vi.mock('@simbo/git-constants', () => ({
  GIT_FOLDER: '.git',
}));

const { isDirectory } = vi.mocked(await import('@simbo/accessible'));
const { cwd } = vi.mocked(await import('node:process'));

describe('isGitRepositoryRoot', () => {
  it('returns true if .git directory exists', async () => {
    isDirectory.mockResolvedValue(true);

    const result = await isGitRepositoryRoot('/some/path');
    expect(result).toBe(true);
    expect(isDirectory).toHaveBeenCalledWith('/some/path/.git');
  });

  it('returns false if .git directory does not exist', async () => {
    isDirectory.mockResolvedValue(false);
    const result = await isGitRepositoryRoot('/some/other/path');
    expect(result).toBe(false);
  });

  it('returns false if isDirectory throws', async () => {
    isDirectory.mockRejectedValue(new Error('FS error'));
    const result = await isGitRepositoryRoot('/error/path');
    expect(result).toBe(false);
  });

  it('uses process.cwd() if no argument is passed', async () => {
    isDirectory.mockResolvedValue(true);
    cwd.mockReturnValue('/cwd/path');
    const result = await isGitRepositoryRoot();
    expect(result).toBe(true);
    expect(isDirectory).toHaveBeenCalledWith('/cwd/path/.git');
  });
});
