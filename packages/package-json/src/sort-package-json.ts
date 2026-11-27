import { sortPackageJson as sort } from 'sort-package-json';
import type { PackageJson } from 'type-fest';

import type { SortPackageJsonOptions } from './package-json.types.js';

/**
 * The default order of the top-level keys, following the `@simbo` packages.
 */
const SORT_ORDER: readonly string[] = [
  '$schema',
  'name',
  'displayName',
  'description',
  'version',
  'private',
  'keywords',
  'author',
  'contributors',
  'maintainers',
  'funding',
  'license',
  'homepage',
  'repository',
  'bugs',
  'engines',
  'devEngines',
  'packageManager',
  'workspaces',
  'type',
  'sideEffects',
  'imports',
  'exports',
  'main',
  'module',
  'types',
  'typesVersions',
  'bin',
  'man',
  'directories',
  'files',
  'publishConfig',
  'scripts',
  'peerDependencies',
  'peerDependenciesMeta',
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'bundleDependencies',
  'bundledDependencies',
];

/**
 * Sorts the keys of a package.json object with `sort-package-json`.
 *
 * Top-level keys follow the given order, then the default order of
 * `sort-package-json`. Nested fields are sorted as `sort-package-json` does,
 * for example dependencies alphabetically and scripts in groups separated by
 * colons, with `pre` and `post` scripts next to their main script.
 *
 * @param packageJson - The package.json object to sort.
 * @param options - Options for sorting.
 * @returns A sorted copy of the package.json object.
 */
export function sortPackageJson(packageJson: PackageJson, options: SortPackageJsonOptions = {}): PackageJson {
  const { sortOrder = SORT_ORDER } = options;
  return sort(packageJson, { sortOrder });
}
