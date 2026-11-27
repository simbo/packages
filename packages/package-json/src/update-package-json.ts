import type { PackageJsonUpdater, WritePackageJsonOptions } from './package-json.types.js';
import { readPackageJson } from './read-package-json.js';
import { writePackageJson } from './write-package-json.js';

/**
 * Updates an existing package.json file.
 *
 * Reads the file, passes its content to the updater, and writes the result as
 * {@link writePackageJson} does. The updater changes the object in place or
 * returns a new one, so it can also remove keys or replace arrays.
 *
 * @param path - The path to the package.json file or its directory.
 * @param update - A function that changes or replaces the package.json object.
 * @param options - Options for writing.
 * @throws {Error} An error if the file cannot be read or written, or the error of the
 * updater.
 */
export async function updatePackageJson(
  path: string,
  update: PackageJsonUpdater,
  options: WritePackageJsonOptions = {},
): Promise<void> {
  const packageJson = await readPackageJson(path);
  const updated = await update(packageJson);
  await writePackageJson(path, updated ?? packageJson, options);
}
