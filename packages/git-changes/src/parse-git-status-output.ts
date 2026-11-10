import { GitChangeStatus } from './git-change-status.enum.js';
import type { GitChange } from './git-changes.types.js';
import { ENTRY_PATH_INDEX, ENTRY_SEPARATOR, ENTRY_STATUS_INDEX, ENTRY_STATUS_LENGTH } from './git-status-constants.js';
import { parseGitChangeStatus } from './parse-git-change-status.js';

/**
 * Parses the output of the Git status command and returns a map of Git changes.
 *
 * @param output - The output string from the Git status command.
 * @returns A ReadonlyMap of file paths to their corresponding GitChange objects.
 */
export function parseGitStatusOutput(output: string): ReadonlyMap<string, GitChange> {
  const changes = new Map<string, GitChange>();
  const entries = output.split(ENTRY_SEPARATOR);

  let index = 0;

  while (index < entries.length) {
    const entry = entries[index++];

    if (!entry) {
      continue;
    }

    const { staged, unstaged } = parseGitChangeStatus(entry.slice(ENTRY_STATUS_INDEX, ENTRY_STATUS_LENGTH));

    const path = entry.slice(ENTRY_PATH_INDEX);

    // Renamed or copied entries contain the new path, followed by an entry with the original path.
    // The original path is consumed even if the entry is invalid, so it is never parsed as an entry.
    if (
      staged === GitChangeStatus.Renamed ||
      staged === GitChangeStatus.Copied ||
      unstaged === GitChangeStatus.Renamed ||
      unstaged === GitChangeStatus.Copied
    ) {
      const originPath = entries[index++];
      if (path && originPath) {
        changes.set(path, { path, originPath, staged, unstaged });
      }
      continue;
    }

    if (!path || (!staged && !unstaged)) {
      continue;
    }

    changes.set(path, { path, staged, unstaged });
  }

  return changes;
}
