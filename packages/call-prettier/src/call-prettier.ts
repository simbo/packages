import { cwd } from 'node:process';

import { isExecutableFile } from '@simbo/accessible';
import { findBin } from '@simbo/find-bin';
import { execa } from 'execa';
import type { SetRequired } from 'type-fest';

import type { Options } from './call-prettier.types.js';

/**
 * Calls Prettier on files matching the provided glob pattern.
 *
 * @param glob - The prettier file glob pattern to match the target files.
 * @param options - The options for calling Prettier.
 * @throws {Error} If the Prettier binary cannot be found or executed.
 * @throws {TypeError} If the provided mode is not 'write' or 'check'.
 */
export async function callPrettier(glob: string, options: Options = {}): Promise<void> {
  const { workingDir = cwd(), mode = 'write' as unknown, disableIgnores = false } = options;

  if (mode !== 'write' && mode !== 'check') {
    throw new TypeError(`Invalid mode '${String(mode)}'. Expected 'write' or 'check'.`);
  }

  const binPath = await getPrettierBinPath({ ...options, workingDir });
  // If this is undefined, we can just return, as exceptions have been handled.
  if (!binPath) return;

  const args = [...(disableIgnores ? ["--ignore-path ''"] : []), `--${mode}`, glob];

  await execa({ cwd: workingDir })(binPath, args);
}

/**
 * Gets the path to the Prettier binary.
 *
 * @param options - The options for finding the Prettier binary.
 * @returns The path to the Prettier binary, or undefined if not found.
 */
async function getPrettierBinPath(options: SetRequired<Options, 'workingDir'>): Promise<string | undefined> {
  const { workingDir, binPath: binPathOption, throwIfNotFound = true } = options;

  if (typeof binPathOption === 'string') {
    if (await isExecutableFile(binPathOption)) {
      return binPathOption;
    } else {
      if (throwIfNotFound) {
        throw new Error(`The provided prettier binary path '${binPathOption}' is not executable.`);
      }
      return undefined;
    }
  } else {
    const binPath = await findBin('prettier', { workingDir });

    if (!binPath) {
      if (throwIfNotFound) {
        throw new Error('Could not determine Prettier binary path.');
      } else {
        return;
      }
    }

    return binPath;
  }
}
