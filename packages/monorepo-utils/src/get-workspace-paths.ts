import { cwd } from 'node:process';

import { getMonorepo } from './get-monorepo.js';

/**
 * Options for getting workspace paths.
 */
export interface GetWorkspacePathsOptions {
  /**
   * A directory inside the monorepo; the root is searched from there.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * Whether to return absolute paths or paths relative to the monorepo root.
   * Defaults to false (relative paths).
   *
   * @default false
   */
  absolutePaths?: boolean;
}

/**
 * Get the paths of all workspaces of the monorepo, sorted by path.
 *
 * The monorepo and its workspaces are found with `@manypkg/get-packages`,
 * which supports npm, pnpm, Yarn, Bun, Lerna, and Rush.
 *
 * @param options - The options for getting workspace paths.
 * @returns An array of workspace paths.
 * @throws {Error} If no monorepo or no workspaces are found, or a manifest cannot be read.
 */
export async function getWorkspacePaths(options: GetWorkspacePathsOptions = {}): Promise<string[]> {
  const { workingDir = cwd(), absolutePaths = false } = options;

  const { packages } = await getMonorepo(workingDir);

  return packages.map(({ dir, relativeDir }) => (absolutePaths ? dir : relativeDir));
}
