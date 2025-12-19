import type { GitChangeStatus } from './git-change-status.enum.js';

/**
 * Common git change statuses for both staged and unstaged changes.
 */
export type GitChangeStatusCommon = GitChangeStatus.Modified | GitChangeStatus.Deleted;

/**
 * Git change statuses that include an origin path.
 */
export type GitChangeStatusWithOriginPath = GitChangeStatus.Renamed | GitChangeStatus.Copied;

/**
 * Added git change status (only for staged changes).
 */
export type GitChangeStatusAdded = GitChangeStatus.Added;

/**
 * Untracked git change status (only for unstaged changes).
 */
export type GitChangeStatusUntracked = GitChangeStatus.Untracked;

export type GitChangeStagedStatus = GitChangeStatusCommon | GitChangeStatusAdded | GitChangeStatusWithOriginPath;
export type GitChangeUnstagedStatus = GitChangeStatusCommon | GitChangeStatusUntracked | GitChangeStatusWithOriginPath;

/**
 * A change in a Git repository.
 */
export type GitChange<
  Staged extends GitChangeStagedStatus | undefined = GitChangeStagedStatus | undefined,
  Unstaged extends GitChangeUnstagedStatus | undefined = GitChangeUnstagedStatus | undefined,
> = GitChangeBase &
  (Staged extends GitChangeStagedStatus ? GitChangeStaged : object) &
  (Unstaged extends GitChangeUnstagedStatus ? GitChangeUnstaged : object) &
  (Staged extends GitChangeStatusWithOriginPath ? GitChangeWithOriginPath : object) &
  (Unstaged extends GitChangeStatusWithOriginPath ? GitChangeWithOriginPath : object);

/**
 * Base interface for a change in a Git repository.
 */
export interface GitChangeBase {
  /**
   * The file path of the change.
   */
  path: string;
}

/**
 * A change in a Git repository that is staged.
 */
export interface GitChangeStaged {
  /**
   * The status of the change when it is staged.
   * This can be one of the GitChangeStatus values or undefined if not staged.
   */
  staged: GitChangeStagedStatus;
}

/**
 * A change in a Git repository that is unstaged.
 */
export interface GitChangeUnstaged {
  /**
   * The status of the change when it is unstaged.
   * This can be one of the GitChangeStatus values or undefined if not unstaged.
   */
  unstaged: GitChangeUnstagedStatus;
}

/**
 * A change in a Git repository that includes an origin path.
 */
export interface GitChangeWithOriginPath {
  /**
   * The original file path before the change (for renamed or copied files).
   */
  originPath: string;
}
