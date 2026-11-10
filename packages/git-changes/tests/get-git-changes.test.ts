import { mkdir, mkdtemp, realpath, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { execa } from 'execa';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getGitChanges, GitChangeStatus } from '../src/index.js';

/**
 * Integration tests running against a temporary Git repository.
 * Global and system Git configurations are disabled to keep results independent of the host.
 */
describe('getGitChanges() with a real Git repository', () => {
  let repo: string;

  /**
   * Runs a Git command in the temporary repository.
   *
   * @param args - The Git command arguments.
   */
  async function git(...args: string[]): Promise<void> {
    await execa('git', args, { cwd: repo });
  }

  /**
   * Writes a file in the temporary repository, creating parent directories as needed.
   *
   * @param path - The file path relative to the repository root.
   * @param content - The file content.
   */
  async function write(path: string, content: string): Promise<void> {
    await mkdir(dirname(join(repo, path)), { recursive: true });
    await writeFile(join(repo, path), content);
  }

  beforeEach(async () => {
    vi.stubEnv('GIT_CONFIG_GLOBAL', '/dev/null');
    vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1');
    vi.stubEnv('GIT_AUTHOR_NAME', 'Test');
    vi.stubEnv('GIT_AUTHOR_EMAIL', 'test@example.com');
    vi.stubEnv('GIT_COMMITTER_NAME', 'Test');
    vi.stubEnv('GIT_COMMITTER_EMAIL', 'test@example.com');

    const tempDir = await mkdtemp(join(tmpdir(), 'git-changes-'));
    repo = await realpath(tempDir);
    await git('init', '--quiet', '--initial-branch=main');
    await write('old.txt', 'old\n');
    await write('modified.txt', 'original\n');
    await write('deleted.txt', 'deleted\n');
    await write('source.txt', 'line 1\nline 2\nline 3\nline 4\nline 5\n');
    await write('link.txt', 'link\n');
    await git('add', '.');
    await git('commit', '--quiet', '--message', 'initial');
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(repo, { recursive: true, force: true });
  });

  it('returns an empty map for a clean repository', async () => {
    expect(await getGitChanges(repo)).toEqual(new Map());
  });

  it('reports a renamed file with the new path and the original path', async () => {
    await git('mv', 'old.txt', 'new.txt');

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'new.txt': { path: 'new.txt', originPath: 'old.txt', staged: GitChangeStatus.Renamed, unstaged: undefined },
    });
  });

  it('reports a copied file with the new path and the original path', async () => {
    // Copy detection in `git status` requires `status.renames=copies` and a modified source.
    vi.stubEnv('GIT_CONFIG_COUNT', '1');
    vi.stubEnv('GIT_CONFIG_KEY_0', 'status.renames');
    vi.stubEnv('GIT_CONFIG_VALUE_0', 'copies');
    await write('copy.txt', 'line 1\nline 2\nline 3\nline 4\nline 5\n');
    await write('source.txt', 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\n');
    await git('add', '.');

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'copy.txt': { path: 'copy.txt', originPath: 'source.txt', staged: GitChangeStatus.Copied, unstaged: undefined },
      'source.txt': { path: 'source.txt', staged: GitChangeStatus.Modified, unstaged: undefined },
    });
  });

  it('reports every file in untracked directories individually', async () => {
    await write('untracked/a.txt', 'a\n');
    await write('untracked/nested/b.txt', 'b\n');

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'untracked/a.txt': { path: 'untracked/a.txt', staged: undefined, unstaged: GitChangeStatus.Untracked },
      'untracked/nested/b.txt': {
        path: 'untracked/nested/b.txt',
        staged: undefined,
        unstaged: GitChangeStatus.Untracked,
      },
    });
  });

  it('reports untracked files even if the configuration hides them', async () => {
    vi.stubEnv('GIT_CONFIG_COUNT', '1');
    vi.stubEnv('GIT_CONFIG_KEY_0', 'status.showUntrackedFiles');
    vi.stubEnv('GIT_CONFIG_VALUE_0', 'no');
    await write('untracked.txt', 'untracked\n');

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'untracked.txt': { path: 'untracked.txt', staged: undefined, unstaged: GitChangeStatus.Untracked },
    });
  });

  it('reports staged and unstaged additions, modifications and deletions', async () => {
    await write('added.txt', 'added\n');
    await git('add', 'added.txt');
    await write('modified.txt', 'staged\n');
    await git('add', 'modified.txt');
    await write('modified.txt', 'unstaged\n');
    await unlink(join(repo, 'deleted.txt'));

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'added.txt': { path: 'added.txt', staged: GitChangeStatus.Added, unstaged: undefined },
      'modified.txt': { path: 'modified.txt', staged: GitChangeStatus.Modified, unstaged: GitChangeStatus.Modified },
      'deleted.txt': { path: 'deleted.txt', staged: undefined, unstaged: GitChangeStatus.Deleted },
    });
  });

  it('reports type changes', async () => {
    await unlink(join(repo, 'link.txt'));
    await symlink('source.txt', join(repo, 'link.txt'));

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'link.txt': { path: 'link.txt', staged: undefined, unstaged: GitChangeStatus.TypeChanged },
    });
  });

  it('reports files with merge conflicts as unmerged', async () => {
    await git('checkout', '--quiet', '-b', 'other');
    await write('modified.txt', 'other\n');
    await write('both-added.txt', 'other\n');
    await git('add', '.');
    await git('commit', '--quiet', '--message', 'other');
    await git('checkout', '--quiet', 'main');
    await write('modified.txt', 'main\n');
    await write('both-added.txt', 'main\n');
    await git('add', '.');
    await git('commit', '--quiet', '--message', 'main');
    await expect(git('merge', 'other')).rejects.toThrow();

    expect(Object.fromEntries(await getGitChanges(repo))).toEqual({
      'modified.txt': { path: 'modified.txt', staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged },
      'both-added.txt': {
        path: 'both-added.txt',
        staged: GitChangeStatus.Unmerged,
        unstaged: GitChangeStatus.Unmerged,
      },
    });
  });

  it('reports paths relative to the repository root when called from a subdirectory', async () => {
    await write('sub/dir/file.txt', 'file\n');
    await write('modified.txt', 'changed\n');

    const changes = await getGitChanges(join(repo, 'sub/dir'));

    expect(Object.fromEntries(changes)).toEqual({
      'modified.txt': { path: 'modified.txt', staged: undefined, unstaged: GitChangeStatus.Modified },
      'sub/dir/file.txt': { path: 'sub/dir/file.txt', staged: undefined, unstaged: GitChangeStatus.Untracked },
    });
  });
});
