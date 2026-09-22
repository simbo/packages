import { resolve } from 'node:path';
import { cwd } from 'node:process';

import { isDirectory } from '@simbo/accessible';
import { GIT_FOLDER } from '@simbo/git-constants';

/**
 * Checks if the given directory is the root of a Git repository.
 *
 * Only succeeds on directories that contain a `.git` folder.
 *
 * Git submodules or worktrees are not considered as roots.
 *
 * @param workingDir - The directory in which to check for the Git root. Defaults to the current working directory.
 * @returns A promise that resolves to true if the directory is a Git root, false otherwise.
 */
export async function isGitRepositoryRoot(workingDir = cwd()): Promise<boolean> {
  try {
    const path = resolve(workingDir, GIT_FOLDER);
    return await isDirectory(path);
  } catch {
    return false;
  }
}
