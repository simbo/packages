import { stringifyError } from '@simbo/stringify-error';
import type { PackageJson } from 'type-fest';
import { writePackage } from 'write-package';

import type { WritePackageJsonOptions } from './package-json.types.js';
import { sortPackageJson } from './sort-package-json.js';

const DEFAULT_INDENT = 2;

/**
 * Writes a package.json file with `write-package`.
 *
 * The file is written atomically and missing directories are created. An
 * existing file keeps its indentation and its trailing newline or lack of one.
 * Empty dependency objects are removed and dependencies are sorted
 * alphabetically.
 *
 * @param path - The path to the package.json file or its directory.
 * @param packageJson - The package.json object to write.
 * @param options - Options for writing.
 * @throws {Error} An error if the file cannot be written.
 */
export async function writePackageJson(
  path: string,
  packageJson: PackageJson,
  options: WritePackageJsonOptions = {},
): Promise<void> {
  const { indent = DEFAULT_INDENT, sort = false } = options;
  try {
    const data = sort ? sortPackageJson(packageJson, sort === true ? {} : sort) : packageJson;
    await writePackage(path, data, { indent });
  } catch (error) {
    throw new Error(`Failed to write package.json: ${stringifyError(error)}`, { cause: error });
  }
}
