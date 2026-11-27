import { symlink, unlink } from 'node:fs/promises';

import { createGitFixture, type GitFixture } from '@simbo/git-fixture';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { getGitChanges, GitChangeStatus } from '../src/index.js';

/**
 * Integration tests running against a temporary Git repository.
 * The neutral configuration of the fixture is set for the process, so that
 * results do not depend on the host.
 */
describe('getGitChanges() with a real Git repository', () => {
  let repo: GitFixture;

  beforeEach(async () => {
    repo = await createGitFixture({
      files: {
        'old.txt': 'old\n',
        'modified.txt': 'original\n',
        'deleted.txt': 'deleted\n',
        'source.txt': 'line 1\nline 2\nline 3\nline 4\nline 5\n',
        'link.txt': 'link\n',
      },
    });
    for (const [name, value] of Object.entries(repo.env)) {
      vi.stubEnv(name, value);
    }
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await repo.cleanup();
  });

  it('returns an empty map for a clean repository', async () => {
    expect(await getGitChanges(repo.dir)).toEqual(new Map());
  });

  it('reports a renamed file with the new path and the original path', async () => {
    await repo.git(['mv', 'old.txt', 'new.txt']);

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'new.txt': { path: 'new.txt', originPath: 'old.txt', staged: GitChangeStatus.Renamed, unstaged: undefined },
    });
  });

  it('reports a copied file with the new path and the original path', async () => {
    // Copy detection in `git status` requires `status.renames=copies` and a modified source.
    vi.stubEnv('GIT_CONFIG_COUNT', '1');
    vi.stubEnv('GIT_CONFIG_KEY_0', 'status.renames');
    vi.stubEnv('GIT_CONFIG_VALUE_0', 'copies');
    await repo.write('copy.txt', 'line 1\nline 2\nline 3\nline 4\nline 5\n');
    await repo.write('source.txt', 'line 1\nline 2\nline 3\nline 4\nline 5\nline 6\n');
    await repo.git(['add', '.']);

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'copy.txt': { path: 'copy.txt', originPath: 'source.txt', staged: GitChangeStatus.Copied, unstaged: undefined },
      'source.txt': { path: 'source.txt', staged: GitChangeStatus.Modified, unstaged: undefined },
    });
  });

  it('reports every file in untracked directories individually', async () => {
    await repo.write('untracked/a.txt', 'a\n');
    await repo.write('untracked/nested/b.txt', 'b\n');

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
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
    await repo.write('untracked.txt', 'untracked\n');

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'untracked.txt': { path: 'untracked.txt', staged: undefined, unstaged: GitChangeStatus.Untracked },
    });
  });

  it('reports staged and unstaged additions, modifications and deletions', async () => {
    await repo.write('added.txt', 'added\n');
    await repo.git(['add', 'added.txt']);
    await repo.write('modified.txt', 'staged\n');
    await repo.git(['add', 'modified.txt']);
    await repo.write('modified.txt', 'unstaged\n');
    await unlink(repo.path('deleted.txt'));

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'added.txt': { path: 'added.txt', staged: GitChangeStatus.Added, unstaged: undefined },
      'modified.txt': { path: 'modified.txt', staged: GitChangeStatus.Modified, unstaged: GitChangeStatus.Modified },
      'deleted.txt': { path: 'deleted.txt', staged: undefined, unstaged: GitChangeStatus.Deleted },
    });
  });

  it('reports type changes', async () => {
    await unlink(repo.path('link.txt'));
    await symlink('source.txt', repo.path('link.txt'));

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'link.txt': { path: 'link.txt', staged: undefined, unstaged: GitChangeStatus.TypeChanged },
    });
  });

  it('reports files with merge conflicts as unmerged', async () => {
    await repo.git(['checkout', '--quiet', '-b', 'other']);
    await repo.write('modified.txt', 'other\n');
    await repo.write('both-added.txt', 'other\n');
    await repo.commit('other');
    await repo.git(['checkout', '--quiet', 'main']);
    await repo.write('modified.txt', 'main\n');
    await repo.write('both-added.txt', 'main\n');
    await repo.commit('main');
    await expect(repo.git(['merge', 'other'])).rejects.toThrow();

    expect(Object.fromEntries(await getGitChanges(repo.dir))).toEqual({
      'modified.txt': { path: 'modified.txt', staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged },
      'both-added.txt': {
        path: 'both-added.txt',
        staged: GitChangeStatus.Unmerged,
        unstaged: GitChangeStatus.Unmerged,
      },
    });
  });

  it('reports paths relative to the repository root when called from a subdirectory', async () => {
    await repo.write('sub/dir/file.txt', 'file\n');
    await repo.write('modified.txt', 'changed\n');

    const changes = await getGitChanges(repo.path('sub/dir'));

    expect(Object.fromEntries(changes)).toEqual({
      'modified.txt': { path: 'modified.txt', staged: undefined, unstaged: GitChangeStatus.Modified },
      'sub/dir/file.txt': { path: 'sub/dir/file.txt', staged: undefined, unstaged: GitChangeStatus.Untracked },
    });
  });
});
