import { basename, dirname } from 'node:path';
import { cwd } from 'node:process';

import { stringifyError } from '@simbo/stringify-error';
import { readPackage } from 'read-pkg';
import type { PackageJson } from 'type-fest';

const NAME = 'package.json';

/**
 * Reads the package.json file from the specified path without normalizing it.
 *
 * @param path - The path to the package.json file or its directory.
 * @returns The parsed package.json object.
 * @throws {Error} An error if the file cannot be read or contains invalid JSON.
 */
export async function readPackageJson(path = cwd()): Promise<PackageJson> {
  try {
    const directory = basename(path) === NAME ? dirname(path) : path;
    return await readPackage({ cwd: directory, normalize: false });
  } catch (error) {
    throw new Error(`Failed to read ${NAME}: ${stringifyError(error)}`, { cause: error });
  }
}
