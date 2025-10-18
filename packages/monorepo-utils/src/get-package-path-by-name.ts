import { relative } from 'node:path';
import { cwd } from 'node:process';

import { readPackageJson } from '@simbo/package-json';
import { stringifyError } from '@simbo/stringify-error';
import Queue from 'p-queue';

import { getWorkspacePaths } from './get-workspace-paths.js';

const DEFAULT_CONCURRENCY = 10;

/**
 * Options for `getPackagePathByName`.
 */
export interface GetPackagePathByNameOptions {
  /**
   * The working directory to get the package path from.
   * Should be the path to the root of the repository.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * Whether to return an absolute path.
   * Defaults to false (relative path).
   *
   * @default false
   */
  absolute?: boolean;

  /**
   * The concurrency level for reading workspaces.
   * If not specified, it will default to 10.
   *
   * @default 10
   */
  concurrency?: number;

  /**
   * Whether to fail on error when reading package.json files.
   * Defaults to false.
   *
   * @default false
   */
  failOnError?: boolean;
}

/**
 * Get the file system path of a package by its name.
 *
 * @param packageName - The name of the package to find.
 * @param options - Options for getting the package path.
 * @returns The file system path of the package.
 * @throws {Error} If the package is not found or if there are errors reading package.json files (when `failOnError` is true).
 */
export async function getPackagePathByName(
  packageName: string,
  options: GetPackagePathByNameOptions = {},
): Promise<string> {
  const { workingDir = cwd(), absolute = false, concurrency = DEFAULT_CONCURRENCY, failOnError = false } = options;

  const workspacePaths = await getWorkspacePaths({ workingDir, absolutePaths: true });

  let absPackagePath: string | undefined;

  const queueErrors = new Map<string, unknown>();
  const queue = new Queue({ concurrency });

  const enqueue = (workspacePath: string): void => {
    queue
      .add(async () => {
        const pkgJson = await readPackageJson(workspacePath);
        if (pkgJson.name === packageName) {
          absPackagePath = workspacePath;
          queue.clear();
        }
      })
      .catch((error: unknown) => {
        queueErrors.set(relative(workingDir, workspacePath), error);
        if (failOnError) {
          queue.clear();
        }
      });
  };

  for (const workspacePath of workspacePaths) {
    enqueue(workspacePath);
  }

  await queue.onIdle();

  if (queueErrors.size > 0 && failOnError) {
    throw new Error(
      `Failed to read package.json files: ${[...queueErrors.entries()]
        .map(([path, error]) => `${path} (${stringifyError(error)})`)
        .join(', ')}`,
    );
  }

  if (!absPackagePath) {
    throw new Error(`Package "${packageName}" not found in workspaces.`);
  }

  if (absolute) {
    return absPackagePath;
  }

  return relative(workingDir, absPackagePath);
}
