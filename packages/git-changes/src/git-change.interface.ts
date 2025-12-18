import type { GitChangeStatus } from './git-change-status.enum.js';

/**
 * Represents a change in a Git repository.
 */
export interface GitChange {
  /**
   * The file path of the change.
   */
  path: string;

  /**
   * The origin file path if the change is a rename or copy.
   * This is only set for changes that involve renaming or copying files.
   */
  originPath?: string;

  /**
   * The status of the change when it is staged.
   * This can be one of the GitChangeStatus values or undefined if not staged.
   */
  staged?:
    | GitChangeStatus.Added
    | GitChangeStatus.Modified
    | GitChangeStatus.Deleted
    | GitChangeStatus.Renamed
    | GitChangeStatus.Copied;

  /**
   * The status of the change when it is unstaged.
   * This can be one of the GitChangeStatus values or undefined if not unstaged.
   */
  unstaged?:
    | GitChangeStatus.Untracked
    | GitChangeStatus.Modified
    | GitChangeStatus.Deleted
    | GitChangeStatus.Renamed
    | GitChangeStatus.Copied;
}
