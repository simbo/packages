import { GitChangeStatus } from './git-change-status.enum.js';

/**
 * The separator used in the output of the git status command.
 * This is a null character, which is used to separate entries in the output.
 */
export const ENTRY_SEPARATOR = '\0';

/**
 * The index in the Git change entry where the staged status is located.
 */
export const ENTRY_STATUS_INDEX = 0;

/**
 * The length of the status string in a Git change entry.
 */
export const ENTRY_STATUS_LENGTH = 2;

/**
 * The index in the Git change entry where the file path starts.
 */
export const ENTRY_PATH_INDEX = ENTRY_STATUS_INDEX + ENTRY_STATUS_LENGTH + 1;

/**
 * A set of known GitChangeStatus values for validation purposes.
 */
export const KNOWN_GIT_CHANGE_STATUSES = new Set<string>(Object.values(GitChangeStatus)) as ReadonlySet<string>;
