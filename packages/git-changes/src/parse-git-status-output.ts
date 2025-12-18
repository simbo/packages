import { GitChangeStatus } from './git-change-status.enum.js';
import type { GitChange } from './git-change.interface.js';
import { ENTRY_PATH_INDEX, ENTRY_SEPARATOR, ENTRY_STATUS_INDEX, ENTRY_STATUS_LENGTH } from './git-status-constants.js';
import { parseGitChangeStatus } from './parse-git-change-status.js';

/**
 * Parses the output of the git status command and returns a map of Git changes.
 *
 * @param output - The output string from the git status command.
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

    if ((!staged && !unstaged) || !path) {
      continue;
    }

    // For entries that are renamed or copied, the current entry contains the old path,
    // and the next entry contains the new path.
    if (
      staged === GitChangeStatus.Renamed ||
      staged === GitChangeStatus.Copied ||
      unstaged === GitChangeStatus.Renamed ||
      unstaged === GitChangeStatus.Copied
    ) {
      if (entries[index]) {
        const targetPath = entries[index++];
        changes.set(targetPath, { path: targetPath, originPath: path, staged, unstaged });
      }
      continue;
    }

    changes.set(path, { path, staged, unstaged });
  }

  return changes;
}
