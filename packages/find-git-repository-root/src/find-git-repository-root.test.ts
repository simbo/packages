import { mkdir, mkdtemp, realpath, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chdir, cwd } from 'node:process';

import { git, GitError } from '@simbo/git-exec';
import { createGitFixture, type GitFixture } from '@simbo/git-fixture';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { findGitRepositoryRoot } from './find-git-repository-root.js';

/**
 * Integration tests running against temporary Git repositories.
 * The neutral configuration of the fixture is set for the process, so that
 * results do not depend on the host.
 */
describe('findGitRepositoryRoot', () => {
  let repo: GitFixture;
  let dir: string;

  beforeEach(async () => {
    repo = await createGitFixture({ files: { 'README.md': '# Test\n' } });
    for (const [name, value] of Object.entries(repo.env)) {
      vi.stubEnv(name, value);
    }
    const tempDir = await mkdtemp(join(tmpdir(), 'find-git-repository-root-'));
    dir = await realpath(tempDir);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await repo.cleanup();
    await rm(dir, { recursive: true, force: true });
  });

  it('returns the root from the root and from a nested subdirectory', async () => {
    await mkdir(repo.path('src/utils'), { recursive: true });

    await expect(findGitRepositoryRoot(repo.dir)).resolves.toBe(repo.dir);
    await expect(findGitRepositoryRoot(repo.path('src/utils'))).resolves.toBe(repo.dir);
  });

  it('returns the root of a linked worktree', async () => {
    const worktree = join(dir, 'worktree');
    await repo.git(['worktree', 'add', '--quiet', '-b', 'feature', worktree]);
    await mkdir(join(worktree, 'src'));

    await expect(findGitRepositoryRoot(join(worktree, 'src'))).resolves.toBe(worktree);
  });

  it('returns the root of a linked worktree inside the main working tree', async () => {
    const worktree = repo.path('.worktrees/feature');
    await repo.git(['worktree', 'add', '--quiet', '-b', 'feature', worktree]);

    await expect(findGitRepositoryRoot(worktree)).resolves.toBe(worktree);
    await expect(findGitRepositoryRoot(repo.path('.worktrees'))).resolves.toBe(repo.dir);
  });

  it('returns the root of a submodule instead of the superproject', async () => {
    await using library = await createGitFixture({ files: { 'index.ts': 'export {};\n' } });
    await repo.git(['-c', 'protocol.file.allow=always', 'submodule', 'add', '--quiet', library.dir, 'vendor/library']);
    const submodule = repo.path('vendor/library');
    await mkdir(join(submodule, 'src'));

    await expect(findGitRepositoryRoot(join(submodule, 'src'))).resolves.toBe(submodule);
    await expect(findGitRepositoryRoot(repo.path('vendor'))).resolves.toBe(repo.dir);
  });

  it('returns the canonical path for a symbolic link into a repository', async () => {
    const link = join(dir, 'link');
    await symlink(repo.dir, link);

    await expect(findGitRepositoryRoot(link)).resolves.toBe(repo.dir);
  });

  it('returns undefined outside a working tree', async () => {
    const plain = join(dir, 'plain');
    await mkdir(join(plain, '.git'), { recursive: true });
    const bare = join(dir, 'bare.git');
    await git(['init', '--quiet', '--bare', bare]);

    await expect(findGitRepositoryRoot(plain)).resolves.toBeUndefined();
    await expect(findGitRepositoryRoot(bare)).resolves.toBeUndefined();
    await expect(findGitRepositoryRoot(repo.path('.git'))).resolves.toBeUndefined();
  });

  it('returns undefined for a missing path and a file', async () => {
    await expect(findGitRepositoryRoot(repo.path('missing'))).resolves.toBeUndefined();
    await expect(findGitRepositoryRoot(repo.path('README.md'))).resolves.toBeUndefined();
  });

  it('starts from the current working directory by default', async () => {
    await mkdir(repo.path('src'));
    const previous = cwd();
    chdir(repo.path('src'));
    try {
      await expect(findGitRepositoryRoot()).resolves.toBe(repo.dir);
    } finally {
      chdir(previous);
    }
  });

  it('rejects with a GitError if Git cannot be started', async () => {
    vi.stubEnv('PATH', '');

    const rejection = await findGitRepositoryRoot(repo.dir).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(GitError);
    expect(rejection).toMatchObject({ exitCode: undefined });
  });
});
