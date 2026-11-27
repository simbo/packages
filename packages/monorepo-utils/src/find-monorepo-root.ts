import { cwd } from 'node:process';

import { findMonorepo } from './get-monorepo.js';

/**
 * Options for finding the monorepo root.
 */
export interface FindMonorepoRootOptions {
  /**
   * The directory to start the search from.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;
}

/**
 * Finds the root of the monorepo that contains the working directory.
 *
 * Searches the working directory and its parents for a workspace configuration
 * of a supported package manager, such as `pnpm-workspace.yaml` or `workspaces`
 * in `package.json` next to a `package-lock.json`. Unlike the root of a Git
 * repository, this is also correct in Git worktrees and for monorepos inside
 * other repositories.
 *
 * @param options - Options for finding the monorepo root.
 * @returns The absolute path of the monorepo root, or `undefined` if no monorepo contains the directory.
 * @throws {Error} If a configuration file or a workspace manifest cannot be read.
 */
export async function findMonorepoRoot(options: FindMonorepoRootOptions = {}): Promise<string | undefined> {
  const { workingDir = cwd() } = options;
  return (await findMonorepo(workingDir))?.rootDir;
}
