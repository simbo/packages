import { mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { git, gitBuffer, GitError, gitSucceeds } from './index.js';

/**
 * Tests running real Git commands in a temporary directory.
 * Global and system Git configurations are disabled to keep results independent of the host.
 */
describe('git-exec', () => {
  let dir: string;

  beforeEach(async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'git-exec-'));
    dir = await realpath(tempDir);
    vi.stubEnv('GIT_CONFIG_GLOBAL', '/dev/null');
    vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1');
    vi.stubEnv('GIT_CEILING_DIRECTORIES', dir);
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, { recursive: true, force: true });
  });

  describe('git()', () => {
    it('returns the trimmed standard output', async () => {
      await git(['init', '--quiet'], { cwd: dir });

      await expect(git(['rev-parse', '--show-toplevel'], { cwd: dir })).resolves.toBe(dir);
    });

    it('runs in the current working directory by default', async () => {
      const expected = await git(['rev-parse', '--show-toplevel'], { cwd: cwd() });

      await expect(git(['rev-parse', '--show-toplevel'])).resolves.toBe(expected);
    });

    it('rejects with a GitError on a non-zero exit code', async () => {
      const rejection = await git(['rev-parse', '--show-toplevel'], { cwd: dir }).catch((error: unknown) => error);

      expect(rejection).toBeInstanceOf(GitError);
      expect(rejection).toMatchObject({ args: ['rev-parse', '--show-toplevel'], exitCode: 128 });
      expect((rejection as GitError).stderr).toMatch(/not a git repository/i);
      expect((rejection as GitError).message).toMatch(
        /^git rev-parse --show-toplevel failed \(exit code 128\): fatal: /,
      );
      expect((rejection as GitError).cause).toBeInstanceOf(Error);
    });

    it('merges env over the process environment and removes undefined variables', async () => {
      vi.stubEnv('GIT_CONFIG_COUNT', '1');
      vi.stubEnv('GIT_CONFIG_KEY_0', 'test.value');
      vi.stubEnv('GIT_CONFIG_VALUE_0', 'from-process');

      await expect(git(['config', 'test.value'], { cwd: dir })).resolves.toBe('from-process');
      await expect(
        git(['config', 'test.value'], { cwd: dir, env: { GIT_CONFIG_VALUE_0: 'from-option' } }),
      ).resolves.toBe('from-option');
      await expect(
        gitSucceeds(['config', 'test.value'], { cwd: dir, env: { GIT_CONFIG_COUNT: undefined } }),
      ).resolves.toBe(false);
    });

    it('passes the command and working directory to debug before running', async () => {
      const debug = vi.fn<(message: string) => void>();

      await git(['init', '--quiet', '--template='], { cwd: dir, debug });

      expect(debug).toHaveBeenCalledTimes(1);
      expect(debug).toHaveBeenCalledWith(`Running git init --quiet --template= in ${dir}`);
    });

    it('quotes arguments with special characters in messages', async () => {
      const debug = vi.fn<(message: string) => void>();

      await gitSucceeds(['log', '--format=%H %s'], { cwd: dir, debug });

      expect(debug).toHaveBeenCalledWith(`Running git log "--format=%H %s" in ${dir}`);
      expect(debug).toHaveBeenLastCalledWith(
        expect.stringMatching(/^git log "--format=%H %s" failed \(exit code 128\)/),
      );
    });
  });

  describe('gitBuffer()', () => {
    it('returns binary output unchanged', async () => {
      const content = Buffer.from([0x00, 0xff, 0x0a, 0x20, 0x0a]);
      await git(['init', '--quiet'], { cwd: dir });
      await writeFile(join(dir, 'blob.bin'), content);
      const oid = await git(['hash-object', '-w', 'blob.bin'], { cwd: dir });

      await expect(gitBuffer(['cat-file', 'blob', oid], { cwd: dir })).resolves.toEqual(content);
    });

    it('rejects with a GitError when the output exceeds maxBuffer', async () => {
      await git(['init', '--quiet'], { cwd: dir });
      await writeFile(join(dir, 'large.txt'), 'x'.repeat(4096));
      const oid = await git(['hash-object', '-w', 'large.txt'], { cwd: dir });

      const rejection = await gitBuffer(['cat-file', 'blob', oid], { cwd: dir, maxBuffer: 1024 }).catch(
        (error: unknown) => error,
      );

      expect(rejection).toBeInstanceOf(GitError);
      expect(rejection).toMatchObject({ exitCode: undefined });
      expect((rejection as GitError).message).toMatch(/maxBuffer/);
    });
  });

  describe('gitSucceeds()', () => {
    it('returns true for exit code 0', async () => {
      await git(['init', '--quiet'], { cwd: dir });

      await expect(gitSucceeds(['rev-parse', '--is-inside-work-tree'], { cwd: dir })).resolves.toBe(true);
    });

    it('returns false for a non-zero exit code and passes the reason to debug', async () => {
      const debug = vi.fn<(message: string) => void>();

      await expect(gitSucceeds(['rev-parse', '--is-inside-work-tree'], { cwd: dir, debug })).resolves.toBe(false);
      expect(debug).toHaveBeenLastCalledWith(
        expect.stringMatching(/^git rev-parse --is-inside-work-tree failed \(exit code 128\): fatal: /),
      );
    });

    it('rejects when Git cannot be started', async () => {
      const rejection = await gitSucceeds(['status'], { cwd: join(dir, 'missing') }).catch((error: unknown) => error);

      expect(rejection).toBeInstanceOf(GitError);
      expect(rejection).toMatchObject({ exitCode: undefined, stderr: '' });
      expect((rejection as GitError).message).toMatch(/^git status failed \(.*ENOENT.*\)$/);
    });
  });
});
