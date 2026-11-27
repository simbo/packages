import { getPackages, type Packages } from '@manypkg/get-packages';
import { stringifyError } from '@simbo/stringify-error';

/**
 * Finds the monorepo that contains the directory and reads its workspaces.
 *
 * @param workingDir - The directory to start the search from.
 * @returns The monorepo, or `undefined` if no monorepo contains the directory.
 * @throws {Error} If a configuration file or a workspace manifest cannot be read.
 */
export async function findMonorepo(workingDir: string): Promise<Packages | undefined> {
  let monorepo: Packages;
  try {
    monorepo = await getPackages(workingDir);
  } catch (error) {
    // The errors for a missing package.json or monorepo name the directory the search started from.
    if (typeof error === 'object' && error !== null && 'directory' in error) {
      return undefined;
    }
    throw new Error(`Failed to read the monorepo at ${workingDir}: ${stringifyError(error)}`, { cause: error });
  }
  // Without a monorepo configuration, manypkg returns the nearest package as a single-package repository.
  return monorepo.tool.type === 'root' ? undefined : monorepo;
}

/**
 * Finds the monorepo that contains the directory and reads its workspaces.
 *
 * @param workingDir - The directory to start the search from.
 * @returns The monorepo.
 * @throws {Error} If no monorepo contains the directory, or a configuration file or a workspace manifest cannot be read.
 */
export async function getMonorepo(workingDir: string): Promise<Packages> {
  const monorepo = await findMonorepo(workingDir);
  if (!monorepo) {
    throw new Error(`No monorepo found from ${workingDir}.`);
  }
  if (monorepo.packages.length === 0) {
    throw new Error(`No workspaces found in ${monorepo.rootDir}.`);
  }
  return monorepo;
}
