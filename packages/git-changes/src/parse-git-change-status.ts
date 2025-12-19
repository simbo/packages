import { GitChangeStatus } from './git-change-status.enum.js';
import type { GitChangeStagedStatus, GitChangeUnstagedStatus } from './git-changes.types.js';
import { KNOWN_GIT_CHANGE_STATUSES } from './git-status-constants.js';

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
export function parseGitChangeStatus(status: string): {
  staged: GitChangeStagedStatus | undefined;
  unstaged: GitChangeUnstagedStatus | undefined;
} {
  if (typeof status !== 'string' || status.length < 2) {
    return { staged: undefined, unstaged: undefined };
  }

  if (status.startsWith('??')) {
    return { staged: undefined, unstaged: GitChangeStatus.Untracked };
  }

  const [staged, unstaged] = [status[0], status[1]].map(char =>
    char && char !== '?' && KNOWN_GIT_CHANGE_STATUSES.has(char) ? char : undefined,
  ) as [GitChangeStagedStatus | undefined, GitChangeUnstagedStatus | undefined];

  return { staged, unstaged };
}
