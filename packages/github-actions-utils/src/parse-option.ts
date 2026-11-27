import { getInput } from '@actions/core';

/**
 * Parses an input that must be one of the given options.
 *
 * The comparison is case-sensitive. Surrounding whitespace is ignored.
 *
 * @param name - The name of the input.
 * @param options - The allowed options.
 * @param defaultValue - The option to return if the input is empty or not set.
 * @returns The parsed option.
 * @throws {Error} if the input is set to a value that is not one of the options.
 */
export function parseOption<T extends string>(name: string, options: readonly T[], defaultValue: T): T {
  const value = getInput(name);
  if (value === '') {
    return defaultValue;
  }
  const option = options.find(candidate => candidate === value);
  if (option === undefined) {
    throw new Error(`Invalid input "${name}": "${value}" (expected one of: ${options.join(', ')}).`);
  }
  return option;
}
