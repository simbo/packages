import { cwd } from 'node:process';

import { isDirectory } from '@simbo/accessible';
import { git, GitError } from '@simbo/git-exec';

/**
 * Finds the root directory of the Git working tree that contains the given directory.
 *
 * Asks Git for the top-level directory with `git rev-parse --show-toplevel`. Inside a linked worktree or a submodule,
 * this is the root of the worktree or submodule. Git resolves symbolic links, so the path is canonical.
 *
 * @param workingDir - The directory from which to find the root. Defaults to the current working directory.
 * @returns A promise that resolves to the absolute path of the root, or `undefined` if the directory is not inside a
 * working tree, for example outside a repository, in a bare repository or in the `.git` directory, or if it does not
 * exist or is not a directory.
 * @throws {GitError} if Git cannot be started or is terminated.
 */
export async function findGitRepositoryRoot(workingDir = cwd()): Promise<string | undefined> {
  if (!(await isDirectory(workingDir))) {
    return undefined;
  }

  try {
    return await git(['rev-parse', '--show-toplevel'], { cwd: workingDir });
  } catch (error) {
    if (error instanceof GitError && error.exitCode !== undefined) {
      return undefined;
    }
    throw error;
  }
}
