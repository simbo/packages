import type { GitChangeStatus } from './git-change-status.enum.js';

export type GitChangeStagedStatus =
  | GitChangeStatus.Added
  | GitChangeStatus.Modified
  | GitChangeStatus.Deleted
  | GitChangeStatus.Renamed
  | GitChangeStatus.Copied;

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
   * This is only set for changes that involve renaming or copying files.
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
