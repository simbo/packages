import { mkdir, mkdtemp, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chdir, cwd } from 'node:process';

import { git, GitError } from '@simbo/git-exec';
import { createGitFixture, type GitFixture } from '@simbo/git-fixture';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { isGitRepositoryRoot } from './is-git-repository-root.js';

/**
 * Integration tests running against temporary Git repositories.
 * The neutral configuration of the fixture is set for the process, so that
 * results do not depend on the host.
 */
describe('isGitRepositoryRoot', () => {
  let repo: GitFixture;
  let dir: string;

  beforeEach(async () => {
    repo = await createGitFixture({ files: { 'README.md': '# Test\n' } });
    for (const [name, value] of Object.entries(repo.env)) {
      vi.stubEnv(name, value);
    }
    const tempDir = await mkdtemp(join(tmpdir(), 'is-git-repository-root-'));
    dir = await realpath(tempDir);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await repo.cleanup();
    await rm(dir, { recursive: true, force: true });
  });

  it('returns true for the root of a repository', async () => {
    await expect(isGitRepositoryRoot(repo.dir)).resolves.toBe(true);
  });

  it('returns false for a subdirectory of a repository', async () => {
    await mkdir(repo.path('src'));

    await expect(isGitRepositoryRoot(repo.path('src'))).resolves.toBe(false);
  });

  it('returns true for the root of a linked worktree', async () => {
    const worktree = join(dir, 'worktree');
    await repo.git(['worktree', 'add', '--quiet', '-b', 'feature', worktree]);

    await expect(isGitRepositoryRoot(worktree)).resolves.toBe(true);
  });

  it('returns true for the root of a submodule and false for its parent directory', async () => {
    await using library = await createGitFixture({ files: { 'index.ts': 'export {};\n' } });
    await repo.git(['-c', 'protocol.file.allow=always', 'submodule', 'add', '--quiet', library.dir, 'vendor/library']);

    await expect(isGitRepositoryRoot(repo.path('vendor/library'))).resolves.toBe(true);
    await expect(isGitRepositoryRoot(repo.path('vendor'))).resolves.toBe(false);
  });

  it('returns true for a symbolic link to the root of a repository', async () => {
    const link = join(dir, 'link');
    await symlink(repo.dir, link);

    await expect(isGitRepositoryRoot(link)).resolves.toBe(true);
  });

  it('returns false for a bare repository and the .git directory', async () => {
    const bare = join(dir, 'bare.git');
    await git(['init', '--quiet', '--bare', bare]);

    await expect(isGitRepositoryRoot(bare)).resolves.toBe(false);
    await expect(isGitRepositoryRoot(repo.path('.git'))).resolves.toBe(false);
  });

  it('returns false for a directory outside a repository, even if it contains a .git directory', async () => {
    await mkdir(join(dir, '.git'));

    await expect(isGitRepositoryRoot(dir)).resolves.toBe(false);
  });

  it('returns false for a missing path and a file', async () => {
    await expect(isGitRepositoryRoot(repo.path('missing'))).resolves.toBe(false);
    await expect(isGitRepositoryRoot(repo.path('README.md'))).resolves.toBe(false);
  });

  it('checks the current working directory by default', async () => {
    const previous = cwd();
    chdir(repo.dir);
    try {
      await expect(isGitRepositoryRoot()).resolves.toBe(true);
    } finally {
      chdir(previous);
    }
  });

  it('rejects with a GitError if Git cannot be started', async () => {
    vi.stubEnv('PATH', '');

    const rejection = await isGitRepositoryRoot(repo.dir).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(GitError);
    expect(rejection).toMatchObject({ exitCode: undefined });
  });
});
