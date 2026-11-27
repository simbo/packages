import { access, mkdir, mkdtemp, readdir, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { devNull, tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { env } from 'node:process';

import { git, GitError } from '@simbo/git-exec';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cloneGitFixture, createGitFixture, type GitFixture } from './index.js';

/**
 * Reports whether a path exists.
 *
 * @param path - The path.
 * @returns `true` if the path exists.
 */
async function exists(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch(() => false);
}

/**
 * Tests creating real Git repositories in a temporary directory, which
 * replaces the system temporary directory through `TMPDIR`.
 */
describe('git-fixture', () => {
  let base: string;

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'git-fixture-test-'));
    base = await realpath(tempDir);
    vi.stubEnv('TMPDIR', base);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(base, { recursive: true, force: true });
  });

  describe('createGitFixture()', () => {
    it('creates an empty repository in a resolved temporary directory', async () => {
      await using repo = await createGitFixture();

      expect(dirname(repo.dir)).toBe(base);
      expect(basename(repo.dir)).toMatch(/^git-fixture-/);
      await expect(repo.git(['rev-parse', '--show-toplevel'])).resolves.toBe(repo.dir);
      await expect(repo.git(['symbolic-ref', '--short', 'HEAD'])).resolves.toBe('main');
      await expect(repo.gitSucceeds(['rev-parse', '--verify', '--quiet', 'HEAD'])).resolves.toBe(false);
    });

    it('uses the prefix and the initial branch of the options', async () => {
      await using repo = await createGitFixture({ prefix: 'custom-', initialBranch: 'trunk' });

      expect(basename(repo.dir)).toMatch(/^custom-/);
      await expect(repo.git(['symbolic-ref', '--short', 'HEAD'])).resolves.toBe('trunk');
    });

    it('commits the files with a fixed author, committer, and date', async () => {
      await using repo = await createGitFixture({ files: { 'a.txt': 'a\n', 'nested/dir/b.txt': 'b\n' } });

      await expect(repo.git(['ls-files'])).resolves.toBe('a.txt\nnested/dir/b.txt');
      await expect(repo.git(['status', '--porcelain'])).resolves.toBe('');
      await expect(repo.git(['log', '--format=%an <%ae>|%cn <%ce>|%aI|%cI|%s'])).resolves.toBe(
        'Test <test@example.com>|Test <test@example.com>|2000-01-01T00:00:00Z|2000-01-01T00:00:00Z|initial',
      );
    });

    it('uses the message and the date of the options', async () => {
      await using repo = await createGitFixture({
        files: { 'a.txt': 'a\n' },
        message: 'first',
        date: new Date('2020-02-03T04:05:06Z'),
      });

      await expect(repo.git(['log', '--format=%aI|%cI|%s'])).resolves.toBe(
        '2020-02-03T04:05:06Z|2020-02-03T04:05:06Z|first',
      );
    });

    it('creates reproducible commit hashes', async () => {
      const files = { 'a.txt': 'a\n' };
      await using first = await createGitFixture({ files });
      await using second = await createGitFixture({ files });
      await using other = await createGitFixture({ files, date: '2001-01-01T00:00:00Z' });

      const head = await first.git(['rev-parse', 'HEAD']);

      await expect(second.git(['rev-parse', 'HEAD'])).resolves.toBe(head);
      await expect(other.git(['rev-parse', 'HEAD'])).resolves.not.toBe(head);
    });

    it('ignores the global Git configuration of the host', async () => {
      const globalConfig = join(base, 'gitconfig');
      await writeFile(globalConfig, '[commit]\n\tgpgsign = true\n[gpg]\n\tprogram = false\n[user]\n\tname = Host\n');
      vi.stubEnv('GIT_CONFIG_GLOBAL', globalConfig);

      await using repo = await createGitFixture({ files: { 'a.txt': 'a\n' } });

      expect(repo.env).toMatchObject({ GIT_CONFIG_GLOBAL: devNull, GIT_CONFIG_NOSYSTEM: '1' });
      await expect(repo.gitSucceeds(['config', 'user.name'])).resolves.toBe(false);
    });

    it('does not sign commits even if the repository configuration asks for it', async () => {
      await using repo = await createGitFixture();
      await repo.git(['config', 'commit.gpgsign', 'true']);
      await repo.git(['config', 'gpg.program', 'false']);

      await expect(repo.commit('unsigned')).resolves.toMatch(/^[\da-f]{40}$/);
    });

    it('does not sign tags even if the repository configuration asks for it', async () => {
      await using repo = await createGitFixture({ files: { 'a.txt': 'a\n' } });
      await repo.git(['config', 'tag.gpgsign', 'true']);
      await repo.git(['config', 'gpg.program', 'false']);

      await repo.git(['tag', '--annotate', '--message', 'unsigned', 'v1.0.0']);

      await expect(repo.git(['cat-file', '-t', 'v1.0.0'])).resolves.toBe('tag');
    });

    it('does not change the environment of the process', async () => {
      const before = { ...env };

      await using repo = await createGitFixture({ files: { 'a.txt': 'a\n' } });

      expect(repo.env.GIT_CONFIG_GLOBAL).toBe(devNull);
      expect({ ...env }).toEqual(before);
    });

    it('does not find repositories above the temporary directory', async () => {
      await using outer = await createGitFixture();
      await mkdir(outer.path('tmp'));
      vi.stubEnv('TMPDIR', outer.path('tmp'));

      await using inner = await createGitFixture();
      await rm(inner.path('.git'), { recursive: true });

      expect(inner.env.GIT_CEILING_DIRECTORIES).toBe(outer.path('tmp'));
      await expect(inner.gitSucceeds(['rev-parse', '--git-dir'])).resolves.toBe(false);
    });

    it('passes every Git command to debug', async () => {
      const debug = vi.fn<(message: string) => void>();

      await using repo = await createGitFixture({ debug });

      expect(debug).toHaveBeenCalledWith(
        `Running git -c commit.gpgsign=false -c tag.gpgsign=false init --quiet --initial-branch=main in ${repo.dir}`,
      );
    });

    it('removes the directory and rejects if Git fails', async () => {
      const rejection = await createGitFixture({ initialBranch: 'in..valid' }).catch((error: unknown) => error);

      expect(rejection).toBeInstanceOf(GitError);
      await expect(readdir(base)).resolves.toEqual([]);
    });
  });

  describe('cloneGitFixture()', () => {
    it('passes a source that starts with a dash as repository, not as option', async () => {
      const marker = join(base, 'marker');

      const rejection = await cloneGitFixture(`--upload-pack=touch ${marker}`).catch((error: unknown) => error);

      expect(rejection).toBeInstanceOf(GitError);
      expect((rejection as GitError).stderr).toMatch(/does not exist/);
      await expect(exists(marker)).resolves.toBe(false);
    });

    it('clones a repository into a resolved temporary directory', async () => {
      await using source = await createGitFixture({ files: { 'a.txt': 'a\n' } });

      await using clone = await cloneGitFixture(source.dir);

      expect(dirname(clone.dir)).not.toBe(source.dir);
      expect(dirname(clone.dir)).toBe(base);
      await expect(clone.git(['rev-parse', '--show-toplevel'])).resolves.toBe(clone.dir);
      await expect(clone.git(['rev-parse', 'HEAD'])).resolves.toBe(await source.git(['rev-parse', 'HEAD']));
      await expect(clone.git(['remote', 'get-url', 'origin'])).resolves.toBe(source.dir);
      await expect(readFile(clone.path('a.txt'), 'utf8')).resolves.toBe('a\n');
    });

    it('passes the arguments to git clone', async () => {
      await using source = await createGitFixture({ files: { 'a.txt': 'a\n' } });
      await source.git(['switch', '--quiet', '--create', 'feature']);
      await source.commit('feature', { 'b.txt': 'b\n' });
      await source.git(['switch', '--quiet', 'main']);

      await using clone = await cloneGitFixture(source.dir, { args: ['--branch', 'feature'], prefix: 'clone-' });

      expect(basename(clone.dir)).toMatch(/^clone-/);
      await expect(clone.git(['symbolic-ref', '--short', 'HEAD'])).resolves.toBe('feature');
      await expect(clone.git(['ls-files'])).resolves.toBe('a.txt\nb.txt');
    });

    it('removes the directory and rejects if Git fails', async () => {
      const rejection = await cloneGitFixture(join(base, 'missing')).catch((error: unknown) => error);

      expect(rejection).toBeInstanceOf(GitError);
      await expect(readdir(base)).resolves.toEqual([]);
    });
  });

  describe('GitFixture', () => {
    let repo: GitFixture;

    beforeEach(async () => {
      repo = await createGitFixture();
    });

    afterEach(async () => {
      await repo.cleanup();
    });

    it('rejects with a GitError if a command fails', async () => {
      await expect(repo.git(['rev-parse', 'HEAD'])).rejects.toBeInstanceOf(GitError);
    });

    it('resolves paths in the repository', () => {
      expect(repo.path()).toBe(repo.dir);
      expect(repo.path('a', 'b.txt')).toBe(join(repo.dir, 'a', 'b.txt'));
    });

    it('writes text and binary files without staging them', async () => {
      await repo.write('nested/a.txt', 'a\n');
      await repo.writeFiles({ 'b.bin': new Uint8Array([0, 1, 2]), 'c.txt': 'c\n' });

      await expect(readFile(repo.path('nested/a.txt'), 'utf8')).resolves.toBe('a\n');
      await expect(readFile(repo.path('b.bin'))).resolves.toEqual(Buffer.from([0, 1, 2]));
      await expect(repo.git(['status', '--porcelain', '--untracked-files=all'])).resolves.toBe(
        '?? b.bin\n?? c.txt\n?? nested/a.txt',
      );
    });

    it('rejects paths outside the repository', async () => {
      await expect(repo.write('../outside.txt', 'x')).rejects.toThrow(/is not a file path inside the repository/);
      await expect(repo.write(join(base, 'outside.txt'), 'x')).rejects.toThrow(/is not a file path inside/);
      await expect(repo.write('.', 'x')).rejects.toThrow(/is not a file path inside/);
      await expect(exists(join(base, 'outside.txt'))).resolves.toBe(false);
    });

    it('rejects paths that leave the repository through symbolic links', async () => {
      const outside = join(base, 'outside');
      await mkdir(outside);
      await writeFile(join(outside, 'file.txt'), 'original\n');
      await symlink(outside, repo.path('dir-link'));
      await symlink(join(outside, 'file.txt'), repo.path('file-link'));
      await symlink(join(outside, 'missing.txt'), repo.path('dangling-link'));

      await expect(repo.write('dir-link/new/a.txt', 'x')).rejects.toThrow(/is not a file path inside/);
      await expect(repo.write('file-link', 'x')).rejects.toThrow(/is not a file path inside/);
      await expect(repo.write('dangling-link', 'x')).rejects.toThrow(/is not a file path inside/);
      await expect(readdir(outside)).resolves.toEqual(['file.txt']);
      await expect(readFile(join(outside, 'file.txt'), 'utf8')).resolves.toBe('original\n');
    });

    it('writes through symbolic links that stay in the repository', async () => {
      await mkdir(repo.path('dir'));
      await symlink('dir', repo.path('dir-link'));

      await repo.write('dir-link/a.txt', 'a\n');

      await expect(readFile(repo.path('dir/a.txt'), 'utf8')).resolves.toBe('a\n');
    });

    it('accepts file names that start with two dots', async () => {
      await repo.write('..a.txt', 'a\n');

      await expect(readFile(repo.path('..a.txt'), 'utf8')).resolves.toBe('a\n');
    });

    it('commits all changes and returns the hash of the commit', async () => {
      await repo.write('a.txt', 'a\n');

      const hash = await repo.commit('add files', { 'b.txt': 'b\n' });

      expect(hash).toBe(await repo.git(['rev-parse', 'HEAD']));
      await expect(repo.git(['show', '--name-only', '--format=%s', 'HEAD'])).resolves.toBe('add files\n\na.txt\nb.txt');
      await expect(repo.git(['status', '--porcelain'])).resolves.toBe('');
    });

    it('creates an empty commit without changes', async () => {
      await repo.commit('first');
      await repo.commit('second');

      await expect(repo.git(['log', '--format=%s'])).resolves.toBe('second\nfirst');
    });

    it('commits binary files', async () => {
      await repo.commit('binary', { 'b.bin': new Uint8Array([0, 255]) });

      await expect(repo.gitSucceeds(['diff', '--quiet', 'HEAD'])).resolves.toBe(true);
      await expect(git(['cat-file', 'blob', 'HEAD:b.bin'], { cwd: repo.dir })).resolves.toBe(
        Buffer.from([0, 255]).toString('utf8'),
      );
    });

    it('provides the neutral configuration for the code under test', async () => {
      await repo.commit('first');

      await expect(git(['log', '--format=%an %aI'], { cwd: repo.dir, env: { ...repo.env } })).resolves.toBe(
        'Test 2000-01-01T00:00:00Z',
      );
    });
  });

  describe('cleanup()', () => {
    it('removes the repository directory', async () => {
      const repo = await createGitFixture({ files: { 'a.txt': 'a\n' } });

      await repo.cleanup();

      await expect(exists(repo.dir)).resolves.toBe(false);
    });

    it('can be called more than once', async () => {
      const repo = await createGitFixture();

      await repo.cleanup();

      await expect(repo.cleanup()).resolves.toBeUndefined();
    });

    it('removes the repository directory at the end of an await using scope', async () => {
      const dirs: string[] = [];
      {
        await using repo = await createGitFixture();
        dirs.push(repo.dir);
        await expect(exists(repo.dir)).resolves.toBe(true);
      }

      await expect(exists(dirs[0] ?? '')).resolves.toBe(false);
    });
  });
});
