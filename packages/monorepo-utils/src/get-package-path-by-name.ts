import { cwd } from 'node:process';

import { getMonorepo } from './get-monorepo.js';

/**
 * Options for `getPackagePathByName`.
 */
export interface GetPackagePathByNameOptions {
  /**
   * A directory inside the monorepo; the root is searched from there.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * Whether to return an absolute path or a path relative to the monorepo root.
   * Defaults to false (relative path).
   *
   * @default false
   */
  absolute?: boolean;
}

/**
 * Get the file system path of a workspace by its package name.
 *
 * @param packageName - The name of the package to find.
 * @param options - Options for getting the package path.
 * @returns The file system path of the package.
 * @throws {Error} If no monorepo is found, a manifest cannot be read, or no workspace has the name.
 */
export async function getPackagePathByName(
  packageName: string,
  options: GetPackagePathByNameOptions = {},
): Promise<string> {
  const { workingDir = cwd(), absolute = false } = options;

  const { packages } = await getMonorepo(workingDir);

  const workspace = packages.find(({ packageJson }) => packageJson.name === packageName);

  if (!workspace) {
    throw new Error(`Package "${packageName}" not found in workspaces.`);
  }

  return absolute ? workspace.dir : workspace.relativeDir;
}
