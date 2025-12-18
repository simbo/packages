import { ExecaError } from 'execa';
import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('./parse-git-status-output.js', () => ({
  parseGitStatusOutput: vi.fn(),
}));

vi.mock('@simbo/find-git-repository-root', () => ({
  findGitRepositoryRoot: vi.fn(),
}));

vi.mock('node:process', () => ({
  cwd: () => '/cwd/foo/bar',
}));

vi.mock('execa', () => ({
  execa: vi.fn(),
  ExecaError: class extends Error {},
}));

const { execa } = vi.mocked(await import('execa'));
const { parseGitStatusOutput } = vi.mocked(await import('./parse-git-status-output.js'));
const { findGitRepositoryRoot } = vi.mocked(await import('@simbo/find-git-repository-root'));

const { getGitChanges } = await import('./get-git-changes.js');

describe('getGitChanges', () => {
  let executor: Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    findGitRepositoryRoot.mockResolvedValue('/cwd');
    executor = vi.fn();
    (execa as Mock).mockReturnValue(executor);
    parseGitStatusOutput.mockReturnValue(new Map());
  });

  it('should call git and pass the output to parseGitStatusOutput', async () => {
    executor.mockResolvedValue({ stdout: 'git status output' });

    const result = await getGitChanges();

    expect(findGitRepositoryRoot).toHaveBeenCalledTimes(1);
    expect(findGitRepositoryRoot).toHaveBeenNthCalledWith(1, '/cwd/foo/bar');
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['git status --porcelain --short --null']);
    expect(parseGitStatusOutput).toHaveBeenCalledTimes(1);
    expect(parseGitStatusOutput).toHaveBeenNthCalledWith(1, 'git status output');
    expect(result).toEqual(new Map());
  });

  it('should use the specified working directory', async () => {
    findGitRepositoryRoot.mockResolvedValueOnce('/custom/dir');
    executor.mockResolvedValue({ stdout: 'git status output' });

    const result = await getGitChanges('/custom/dir');

    expect(findGitRepositoryRoot).toHaveBeenCalledTimes(1);
    expect(findGitRepositoryRoot).toHaveBeenNthCalledWith(1, '/custom/dir');
    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/custom/dir' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['git status --porcelain --short --null']);
    expect(parseGitStatusOutput).toHaveBeenCalledTimes(1);
    expect(parseGitStatusOutput).toHaveBeenNthCalledWith(1, 'git status output');
    expect(result).toEqual(new Map());
  });

  it('should throw an error if the git command fails', async () => {
    executor.mockRejectedValueOnce(new Error('git error'));

    await expect(getGitChanges()).rejects.toThrowError('Failed to get Git changes: git error');

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['git status --porcelain --short --null']);
    expect(parseGitStatusOutput).not.toHaveBeenCalled();
  });

  it('should handle ExecaError specifically', async () => {
    const execaError = new ExecaError();
    execaError.shortMessage = 'short execa error message';
    executor.mockRejectedValueOnce(execaError);
    await expect(getGitChanges()).rejects.toThrowError('Failed to get Git changes: short execa error message');

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['git status --porcelain --short --null']);
    expect(parseGitStatusOutput).not.toHaveBeenCalled();
  });

  it('should handle unknown error types', async () => {
    executor.mockRejectedValueOnce(42);
    await expect(getGitChanges()).rejects.toThrowError('Failed to get Git changes: Unknown error (42)');

    expect(execa).toHaveBeenCalledTimes(1);
    expect(execa).toHaveBeenNthCalledWith(1, { cwd: '/cwd' });
    expect(executor).toHaveBeenCalledTimes(1);
    expect(executor).toHaveBeenNthCalledWith(1, ['git status --porcelain --short --null']);
    expect(parseGitStatusOutput).not.toHaveBeenCalled();
  });

  it('should throw an error if the working directory is not part of a Git repository', async () => {
    findGitRepositoryRoot.mockResolvedValueOnce(undefined);

    await expect(getGitChanges('/not/a/repo')).rejects.toThrowError(
      'The directory "/not/a/repo" is not part of a Git repository.',
    );

    expect(findGitRepositoryRoot).toHaveBeenCalledTimes(1);
    expect(findGitRepositoryRoot).toHaveBeenNthCalledWith(1, '/not/a/repo');
    expect(execa).not.toHaveBeenCalled();
    expect(parseGitStatusOutput).not.toHaveBeenCalled();
  });
});
