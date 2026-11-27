import { realpath } from 'node:fs/promises';
import { cwd } from 'node:process';

import { isDirectory } from '@simbo/accessible';
import { git, GitError } from '@simbo/git-exec';

/**
 * Checks if the given directory is the root of a Git working tree.
 *
 * Asks Git for the top-level directory of the working tree with `git rev-parse --show-toplevel` and compares it with
 * the given directory after resolving symbolic links in both paths. The roots of linked worktrees and submodules
 * count as roots; bare repositories, the `.git` directory and directories outside a repository do not.
 *
 * @param workingDir - The directory to check. Defaults to the current working directory.
 * @returns A promise that resolves to `true` if the directory is the root of a Git working tree, `false` otherwise,
 * also if it does not exist or is not a directory.
 * @throws {GitError} if Git cannot be started or is terminated.
 */
export async function isGitRepositoryRoot(workingDir = cwd()): Promise<boolean> {
  if (!(await isDirectory(workingDir))) {
    return false;
  }

  const directory = await realpath(workingDir);

  try {
    const topLevel = await git(['rev-parse', '--show-toplevel'], { cwd: directory });
    return (await realpath(topLevel)) === directory;
  } catch (error) {
    if (error instanceof GitError && error.exitCode !== undefined) {
      return false;
    }
    throw error;
  }
}
