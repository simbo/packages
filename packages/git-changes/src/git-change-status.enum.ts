/**
 * Enum representing the possible statuses of a change in a Git repository.
 * Each status corresponds to a single character used in the output of `git status`.
 */
export enum GitChangeStatus {
  Added = 'A',
  Modified = 'M',
  Deleted = 'D',
  Renamed = 'R',
  Copied = 'C',
  Untracked = '?',
}
