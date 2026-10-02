import { GitChangeStatus } from './git-change-status.enum.js';
import type { GitChange } from './git-changes.types.js';

const trackedStatuses = Object.values(GitChangeStatus).filter(value => value !== GitChangeStatus.Untracked);

/**
 * Parses a Git change status string into staged and unstaged statuses.
 *
 * The status string is expected to be at least two characters long, where:
 * - The first character represents the staged status.
 * - The second character represents the unstaged status.
 *
 * If the status is '??', it indicates an untracked file.
 *
 * This should match the output of `git status --porcelain`.
 *
 * @param status - A two-character string representing the Git change status.
 * @returns An object containing the staged and unstaged statuses.
 */
export function parseGitChangeStatus(status: string): Pick<GitChange, 'staged' | 'unstaged'> {
  if (typeof status !== 'string' || status.length < 2) {
    return { staged: undefined, unstaged: undefined };
  }

  if (status.startsWith('??')) {
    return { staged: undefined, unstaged: GitChangeStatus.Untracked };
  }

  const staged = trackedStatuses.find((value: string) => value === status[0]);
  const unstaged = trackedStatuses.find((value: string) => value === status[1]);

  return { staged, unstaged };
}
