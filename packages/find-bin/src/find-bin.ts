import { posix, resolve, sep } from 'node:path';
import { cwd, env } from 'node:process';

import { npmRunPath } from 'npm-run-path';
import which from 'which';

/**
 * Options for finding a binary executable.
 */
export interface Options {
  /**
   * The working directory to start searching for the binary in.
   * If not specified, the current working directory will be used.
   *
   * @default process.cwd()
   */
  workingDir?: string;
}

/**
 * Finds the path to a binary executable.
 *
 * Looks in the `node_modules/.bin` directories from the working directory up
 * to the file system root first, then in the directories of the `PATH`
 * environment variable. A name that contains a path separator is resolved
 * against the working directory instead.
 *
 * @param name - The name of the binary to find.
 * @param options - Options for finding the binary.
 * @returns The path to the binary if found, or undefined if not.
 */
export async function findBin(name: string, options: Options = {}): Promise<string | undefined> {
  const { workingDir = cwd() } = options;

  if (typeof name !== 'string') {
    throw new TypeError('Command name must be a string');
  }

  name = name.trim();

  if (name.length === 0) {
    throw new Error('Command name must not be empty');
  }

  if (name.includes(posix.sep) || name.includes(sep)) {
    return (await which(resolve(workingDir, name), { nothrow: true })) ?? undefined;
  }

  const path = npmRunPath({ cwd: workingDir, path: env.PATH ?? '', addExecPath: false });

  return (await which(name, { path, nothrow: true })) ?? undefined;
}
