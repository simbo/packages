import { GitChangeStatus } from './git-change-status.enum.js';
import type { GitChange } from './git-changes.types.js';

const trackedStatuses = Object.values(GitChangeStatus).filter(
  value => value !== GitChangeStatus.Untracked && value !== GitChangeStatus.Unmerged,
);

/**
 * Status combinations that mark a file with merge conflicts ("unmerged").
 * - `DD`: both deleted
 * - `AU`: added by us
 * - `UD`: deleted by them
 * - `UA`: added by them
 * - `DU`: deleted by us
 * - `AA`: both added
 * - `UU`: both modified
 */
const unmergedStatuses = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);

/**
 * Parses a Git change status string into staged and unstaged statuses.
 *
 * The status string is expected to be at least two characters long, where:
 * - The first character represents the staged status.
 * - The second character represents the unstaged status.
 *
 * If the status is '??', it indicates an untracked file.
 *
 * If the status is one of the unmerged combinations (DD, AU, UD, UA, DU, AA, UU),
 * it indicates a file with merge conflicts and both statuses are `Unmerged`.
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

  if (unmergedStatuses.has(status.slice(0, 2))) {
    return { staged: GitChangeStatus.Unmerged, unstaged: GitChangeStatus.Unmerged };
  }

  const staged = trackedStatuses.find((value: string) => value === status[0]);
  const unstaged = trackedStatuses.find((value: string) => value === status[1]);

  return { staged, unstaged };
}
