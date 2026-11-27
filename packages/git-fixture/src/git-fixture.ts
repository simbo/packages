import { lstat, mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { devNull, tmpdir } from 'node:os';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import { git, gitSucceeds } from '@simbo/git-exec';

import type {
  CloneGitFixtureOptions,
  CreateGitFixtureOptions,
  GitFixture,
  GitFixtureFiles,
  GitFixtureOptions,
} from './git-fixture.types.js';

/**
 * The default author and committer date.
 */
const DEFAULT_DATE = '2000-01-01T00:00:00Z';

/**
 * The author and committer name.
 */
const NAME = 'Test';

/**
 * The author and committer email.
 */
const EMAIL = 'test@example.com';

/**
 * Configuration passed with `-c` to every Git command of a fixture, so that
 * a repository configuration cannot turn signing on.
 */
const CONFIG_ARGS = ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false'] as const;

/**
 * Creates a temporary Git repository, optionally with an initial commit.
 *
 * The repository and all of its Git commands use a neutral configuration:
 * global and system configurations are ignored, Git does not search for
 * repositories above the temporary directory, and author, committer, and
 * dates are fixed.
 *
 * @param options - Options for the repository.
 * @returns The fixture.
 * @throws {GitError} if Git fails; the directory is removed then.
 */
export async function createGitFixture(options: CreateGitFixtureOptions = {}): Promise<GitFixture> {
  const { initialBranch = 'main', files, message = 'initial' } = options;
  const fixture = await createFixture(options);

  try {
    await fixture.git(['init', '--quiet', `--initial-branch=${initialBranch}`]);
    if (files) {
      await fixture.commit(message, files);
    }
  } catch (error) {
    await fixture.cleanup();
    throw error;
  }

  return fixture;
}

/**
 * Clones a repository into a temporary directory with the same neutral
 * configuration as `createGitFixture()`.
 *
 * The source is passed to Git as given. Pass untrusted values neither as
 * source nor in `args`: options such as `--upload-pack` make Git run commands.
 *
 * @param source - The path or URL of the repository to clone.
 * @param options - Options for the clone.
 * @returns The fixture of the clone.
 * @throws {GitError} if Git fails; the directory is removed then.
 */
export async function cloneGitFixture(source: string, options: CloneGitFixtureOptions = {}): Promise<GitFixture> {
  const { args = [] } = options;
  const fixture = await createFixture(options);

  try {
    await fixture.git(['clone', '--quiet', ...args, '--', source, '.']);
  } catch (error) {
    await fixture.cleanup();
    throw error;
  }

  return fixture;
}

/**
 * Creates a temporary directory and the fixture helpers for it.
 *
 * @param options - Options for the fixture.
 * @returns The fixture.
 */
async function createFixture(options: GitFixtureOptions): Promise<GitFixture> {
  const { prefix = 'git-fixture-', date = DEFAULT_DATE, debug } = options;

  const tempDir = await mkdtemp(join(tmpdir(), prefix));
  const dir = await realpath(tempDir);
  const gitDate = typeof date === 'string' ? date : date.toISOString();

  const env: Readonly<Record<string, string>> = Object.freeze({
    GIT_CONFIG_GLOBAL: devNull,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CEILING_DIRECTORIES: dirname(dir),
    GIT_TERMINAL_PROMPT: '0',
    GIT_AUTHOR_NAME: NAME,
    GIT_AUTHOR_EMAIL: EMAIL,
    GIT_AUTHOR_DATE: gitDate,
    GIT_COMMITTER_NAME: NAME,
    GIT_COMMITTER_EMAIL: EMAIL,
    GIT_COMMITTER_DATE: gitDate,
  });

  const run = async (args: readonly string[]): Promise<string> =>
    git([...CONFIG_ARGS, ...args], { cwd: dir, env, debug });

  const succeeds = async (args: readonly string[]): Promise<boolean> =>
    gitSucceeds([...CONFIG_ARGS, ...args], { cwd: dir, env, debug });

  const write = async (path: string, contents: string | Uint8Array): Promise<void> => {
    const file = await resolveInside(dir, path);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, contents);
  };

  const writeFiles = async (files: GitFixtureFiles): Promise<void> => {
    for (const [path, contents] of Object.entries(files)) {
      await write(path, contents);
    }
  };

  const cleanup = async (): Promise<void> => rm(dir, { recursive: true, force: true });

  return {
    dir,
    env,
    git: run,
    gitSucceeds: succeeds,
    path: (...segments: string[]): string => join(dir, ...segments),
    write,
    writeFiles,
    commit: async (message: string, files: GitFixtureFiles = {}): Promise<string> => {
      await writeFiles(files);
      await run(['add', '--all']);
      await run(['commit', '--quiet', '--allow-empty', '--message', message]);
      return run(['rev-parse', 'HEAD']);
    },
    cleanup,
    [Symbol.asyncDispose]: cleanup,
  };
}

/**
 * Resolves a path relative to a directory and ensures that it stays inside,
 * also through symbolic links.
 *
 * @param dir - The directory, with symbolic links resolved.
 * @param path - The relative path.
 * @returns The absolute path.
 * @throws {Error} if the path or the target of a symbolic link is outside the directory.
 */
async function resolveInside(dir: string, path: string): Promise<string> {
  const file = resolve(dir, path);
  const outside = new Error(`The path "${path}" is not a file path inside the repository "${dir}".`);

  if (!isInside(dir, file)) {
    throw outside;
  }

  // The deepest existing ancestor and an existing file may be symbolic links.
  let existing = file;
  while (
    !(await lstat(existing)
      .then(() => true)
      .catch(() => false))
  ) {
    existing = dirname(existing);
  }
  let target: string;
  try {
    target = await realpath(existing);
  } catch {
    throw outside;
  }

  if (target !== dir && !isInside(dir, target)) {
    throw outside;
  }

  return file;
}

/**
 * Reports whether a path is inside a directory, not the directory itself.
 *
 * @param dir - The directory.
 * @param path - The absolute path.
 * @returns `true` if the path is inside the directory.
 */
function isInside(dir: string, path: string): boolean {
  const relativePath = relative(dir, path);
  return (
    relativePath !== '' && relativePath !== '..' && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath)
  );
}
