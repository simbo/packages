import type { PackageJson } from 'type-fest';

/**
 * Options for sorting a package.json object.
 */
export interface SortPackageJsonOptions {
  /**
   * The order of the top-level keys. Keys missing from the list follow in the
   * default order of `sort-package-json`. Defaults to the order of the
   * `@simbo` packages.
   */
  sortOrder?: readonly string[];
}

/**
 * Options for writing a package.json file.
 */
export interface WritePackageJsonOptions {
  /**
   * The indentation for new files, as a number of spaces or a string such as
   * `'\t'`. Existing files keep their indentation. Defaults to `2`.
   */
  indent?: number | string;

  /**
   * Whether to sort the keys before writing. Pass options to change the order.
   * Defaults to `false`.
   */
  sort?: boolean | SortPackageJsonOptions;
}

/**
 * A function that receives the current package.json object and either changes
 * it in place or returns a new one.
 */
export type PackageJsonUpdater = (
  packageJson: PackageJson,
) => PackageJson | undefined | Promise<PackageJson | undefined>;
