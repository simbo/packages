import type { GitChangeStatus } from './git-change-status.enum.js';

/**
 * Staged git change statuses.
 */
export type GitChangeStagedStatus =
  | GitChangeStatus.Added
  | GitChangeStatus.Modified
  | GitChangeStatus.Deleted
  | GitChangeStatus.Renamed
  | GitChangeStatus.Copied;

/**
 * Unstaged git change statuses.
 */
export type GitChangeUnstagedStatus =
  | GitChangeStatus.Untracked
  | GitChangeStatus.Modified
  | GitChangeStatus.Deleted
  | GitChangeStatus.Renamed
  | GitChangeStatus.Copied;

/**
 * Represents a change in a Git repository.
 */
export interface GitChange<
  Staged extends GitChangeStagedStatus | undefined = GitChangeStagedStatus | undefined,
  Unstaged extends GitChangeUnstagedStatus | undefined = GitChangeUnstagedStatus | undefined,
> {
  /**
   * The file path of the change.
   */
  path: string;

  /**
   * The origin file path if the change is a rename or copy.
   */
  originPath?: Staged extends GitChangeStatus.Renamed | GitChangeStatus.Copied
    ? string
    : Unstaged extends GitChangeStatus.Renamed | GitChangeStatus.Copied
      ? string
      : undefined;

  /**
   * The status of the change when it is staged.
   * This can be one of the GitChangeStatus values or undefined if not staged.
   */
  staged?: Staged;

  /**
   * The status of the change when it is unstaged.
   * This can be one of the GitChangeStatus values or undefined if not unstaged.
   */
  unstaged?: Unstaged;
}
