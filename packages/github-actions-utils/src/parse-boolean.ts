import { getInput } from '@actions/core';

/**
 * The accepted values of a boolean input, as in the YAML 1.2 core schema.
 */
const BOOLEAN_VALUES: ReadonlyMap<string, boolean> = new Map([
  ['true', true],
  ['True', true],
  ['TRUE', true],
  ['false', false],
  ['False', false],
  ['FALSE', false],
]);

/**
 * Parses a boolean input strictly.
 *
 * Accepts only the boolean values of the YAML 1.2 core schema, `true`, `True`,
 * `TRUE`, `false`, `False`, and `FALSE`, like `core.getBooleanInput`.
 * Surrounding whitespace is ignored.
 *
 * @param name - The name of the input.
 * @param defaultValue - The value to return if the input is empty or not set.
 * @returns The parsed boolean.
 * @throws {Error} if the input is set to any other value.
 */
export function parseBoolean(name: string, defaultValue: boolean): boolean {
  const value = getInput(name);
  if (value === '') {
    return defaultValue;
  }
  const parsed = BOOLEAN_VALUES.get(value);
  if (parsed === undefined) {
    throw new Error(`Invalid input "${name}": "${value}" (expected one of: ${[...BOOLEAN_VALUES.keys()].join(', ')}).`);
  }
  return parsed;
}
