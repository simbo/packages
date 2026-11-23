import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { cwd } from 'node:process';

import { stringifyError } from '@simbo/stringify-error';
import type { PackageJson } from 'type-fest';

const NAME = 'package.json';

/**
 * Reads the package.json file from the specified base path.
 *
 * @param path - The path to the package.json file or its directory.
 * @returns The parsed package.json object.
 */
export async function readPackageJson(path = cwd()): Promise<PackageJson> {
  let packageJson: PackageJson;
  try {
    const packageJsonPath = basename(path) === NAME ? path : resolve(path, NAME);
    const content = await readFile(packageJsonPath, 'utf8');
    packageJson = JSON.parse(content) as PackageJson;
  } catch (error) {
    throw new Error(`Failed to read ${NAME}: ${stringifyError(error)}`, { cause: error });
  }
  return packageJson;
}
