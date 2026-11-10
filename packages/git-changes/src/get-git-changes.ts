import { cwd } from 'node:process';

import { findGitRepositoryRoot } from '@simbo/find-git-repository-root';
import { execa, ExecaError } from 'execa';

import type { GitChange } from './git-changes.types.js';
import { parseGitStatusOutput } from './parse-git-status-output.js';

/**
 * Gets the uncommitted Git changes in the specified working directory.
 *
 * @param workingDir - The working directory of the Git repository. Defaults to the current working directory.
 * @returns A ReadonlyMap of file paths to their corresponding GitChange objects.
 */
export async function getGitChanges(workingDir = cwd()): Promise<ReadonlyMap<string, GitChange>> {
  const repoRoot = await findGitRepositoryRoot(workingDir);

  if (!repoRoot) {
    throw new Error(`The directory "${workingDir}" is not part of a Git repository.`);
  }

  try {
    /**
     * This command provides a machine-readable, null-separated output of the
     * current status of the Git repository, including staged and unstaged changes,
     * as well as untracked files. Untracked directories are listed as individual
     * files, regardless of the `status.showUntrackedFiles` configuration.
     * Paths are relative to the repository root.
     *
     * Example output (renamed and copied entries list the new path first):
     * '?? untracked.ts\0'
     * ' M unstaged-modified.ts\0'
     * 'M  staged-modified.ts\0'
     * 'MM both-modified.ts\0'
     * ' D unstaged-deleted.ts\0'
     * 'A  staged-added.ts\0'
     * ' T type-changed.ts\0'
     * 'UU conflicted.ts\0'
     * 'R  new.ts\0old.ts\0'
     * 'C  copied.ts\0source.ts\0'
     */
    const { stdout: output } = await execa({ cwd: repoRoot })`git status --porcelain --null --untracked-files=all`;

    return parseGitStatusOutput(output);
  } catch (error) {
    const reason =
      error instanceof ExecaError
        ? error.shortMessage
        : error instanceof Error
          ? error.message
          : `Unknown error (${String(error)})`;
    throw new Error(`Failed to get Git changes: ${reason}`, { cause: error });
  }
}
