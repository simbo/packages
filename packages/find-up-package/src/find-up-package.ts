import { cwd } from 'node:process';

import { readPackageJson } from '@simbo/package-json';
import { findUp } from 'find-up';

import type {
  Options,
  OptionsWithNormalize,
  OptionsWithoutNormalize,
  Package,
  PackageNormalized,
} from './find-up-package.types.js';

/**
 * Walks up the directory tree from the specified working directory, looking for
 * a package.json file that matches the required criteria.
 *
 * @param options - Options for the search.
 *
 * @returns An object containing the path to the directory and the parsed
 * package.json or undefined if no match is found.
 */
export async function findUpPackage(options: OptionsWithNormalize): Promise<PackageNormalized | undefined>;
export async function findUpPackage(options: OptionsWithoutNormalize): Promise<Package | undefined>;
export async function findUpPackage(options: Options = {}): Promise<Package | PackageNormalized | undefined> {
  const { matchFn = result => !!(result.path && result.packageJson), workingDir = cwd(), normalize = false } = options;

  let matchedPackage: Package | undefined;

  const findUpMatcher = async (path: string): Promise<string | undefined> => {
    try {
      const packageJson = await readPackageJson(path);
      const matchResult = matchFn({ path, packageJson });
      const isMatch =
        typeof matchResult === 'object' && matchResult instanceof Promise ? await matchResult : matchResult;

      if (isMatch) {
        matchedPackage = { path, packageJson };
        return path;
      }
    } catch {
      matchedPackage = undefined;
    }
    return undefined;
  };

  await findUp(findUpMatcher, { cwd: workingDir, type: 'directory' });

  if (!matchedPackage) return;

  if (normalize) {
    const warnFn = typeof normalize === 'object' && normalize.warn ? normalize.warn : () => {};
    const strict = typeof normalize === 'object' && normalize.strict ? normalize.strict : false;
    const { default: normalizePackageData } = await import('normalize-package-data');
    normalizePackageData(matchedPackage.packageJson, warnFn, strict);
  }

  return matchedPackage;
}
