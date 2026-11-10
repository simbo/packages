import type { GitChangeStatus } from './git-change-status.enum.js';

/**
 * Common Git change statuses for both staged and unstaged changes.
 */
export type GitChangeStatusCommon = GitChangeStatus.Modified | GitChangeStatus.TypeChanged | GitChangeStatus.Deleted;

/**
 * Git change statuses that include an origin path.
 */
export type GitChangeStatusWithOriginPath = GitChangeStatus.Renamed | GitChangeStatus.Copied;

/**
 * Added Git change status.
 */
export type GitChangeStatusAdded = GitChangeStatus.Added;

/**
 * Untracked Git change status (only for unstaged changes).
 */
export type GitChangeStatusUntracked = GitChangeStatus.Untracked;

/**
 * Unmerged Git change status (always set for both staged and unstaged changes
 * of a file with merge conflicts).
 */
export type GitChangeStatusUnmerged = GitChangeStatus.Unmerged;

/**
 * Combined type for staged changes field.
 */
export type GitChangeStagedStatus =
  GitChangeStatusCommon | GitChangeStatusAdded | GitChangeStatusWithOriginPath | GitChangeStatusUnmerged;

/**
 * Combined type for unstaged changes field.
 */
export type GitChangeUnstagedStatus =
  | GitChangeStatusCommon
  | GitChangeStatusAdded
  | GitChangeStatusUntracked
  | GitChangeStatusWithOriginPath
  | GitChangeStatusUnmerged;

/**
 * Interface for a change in a Git repository.
 */
export interface GitChange {
  /**
   * The file path of the change, relative to the repository root.
   * For renamed or copied files, this is the new path.
   */
  path: string;

  /**
   * The status of the change if it is staged.
   * This can be one of the GitChangeStatus values or undefined if not staged.
   */
  staged?: GitChangeStagedStatus;

  /**
   * The status of the change if it is unstaged.
   * This can be one of the GitChangeStatus values or undefined if not unstaged.
   */
  unstaged?: GitChangeUnstagedStatus;

  /**
   * The original file path before the change (for renamed or copied files),
   * relative to the repository root.
   */
  originPath?: string;
}
