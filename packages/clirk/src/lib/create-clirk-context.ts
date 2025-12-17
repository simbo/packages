import { basename } from 'node:path';
import { argv } from 'node:process';

import { findUpPackage } from '@simbo/find-up-package';
import minimist from 'minimist';

import type { ParsedMinimistOptions } from '../schemas/minimist-options-schema.js';
import type { ParsedOptions } from '../schemas/options-schema.js';
import type { CliOption, CliParameter, ClirkContextWithoutMessages } from '../types/clirk-context.interface.js';

/**
 * Creates a ClirkContext based on the provided CLI options.
 *
 * This sets up the runtime context needed by clirk, including:
 * - reading the CLI's own package.json
 * - parsing CLI arguments using minimist
 * - normalizing description, examples, usage, parameters, and options
 * - resolving aliases and flag types (boolean/string)
 *
 * @param parsedOptions - The parsed options for the CLI.
 * @returns A promise that resolves to a ClirkContextWithoutMessages object.
 * @throws {Error} If `importMetaDirname` is not provided.
 */
export async function createClirkContext(parsedOptions: ParsedOptions): Promise<ClirkContextWithoutMessages> {
  const {
    importMetaDirname: importPath,
    argsOptions,
    title,
    name: binName,
    icon,
    description,
    examples,
    usage,
    usageLabel,
    parameters: parametersArray,
    parametersLabel,
    options: optionsArray,
    optionsLabel,
    sigintHandler,
    sigintMessage,
  } = parsedOptions;

  const pkg = await findUpPackage({
    workingDir: importPath,
    normalize: true,
  });

  if (pkg === undefined) {
    throw new Error(`Could not find package for path: ${importPath}`);
  }

  if (description.length === 0 && pkg.packageJson.description) {
    description.push(pkg.packageJson.description);
  }

  const commandName = basename(argv[1]);

  const parameters = getParametersMap(parametersArray);
  const options = getOptionsMap(argsOptions, optionsArray);

  const name = binName ?? (typeof pkg.packageJson.bin === 'object' ? Object.keys(pkg.packageJson.bin)[0] : commandName);

  if (examples.length === 0) {
    examples.push(`${name} [OPTIONS]${parameters.size > 0 ? ` <${[...parameters.keys()].join('> <')}>` : ''}`);
  }

  const args = minimist(argv.slice(2), argsOptions);

  return {
    importPath,
    argsOptions,
    args,
    title,
    name,
    commandName,
    package: pkg,
    description,
    examples,
    usage,
    usageLabel,
    parameters,
    parametersLabel,
    options,
    optionsLabel,
    icon,
    sigintHandler,
    sigintMessage,
  };
}

/**
 * Creates the parameters map for the clirk context.
 *
 * @param parameters - The user-supplied options for the CLI definition.
 * @returns A Map of parameter names to their descriptions.
 */
function getParametersMap(parameters: Record<string, string[]>): Map<string, CliParameter> {
  return new Map(Object.entries(parameters).map(([key, value]) => [key, { description: value }]));
}

/**
 * Creates the options map for the clirk context.
 *
 * @param argsOptions - The parsed arguments options.
 * @param options - The records of options descriptions.
 * @returns A Map of option names to their descriptions and properties.
 */
function getOptionsMap(argsOptions: ParsedMinimistOptions, options: Record<string, string[]>): Map<string, CliOption> {
  return new Map(
    Object.entries(options).map(([key, description]) => {
      const aliases = new Set<string>(argsOptions.alias[key] ?? []);
      const type = argsOptions.boolean.includes(key)
        ? 'boolean'
        : argsOptions.string.includes(key)
          ? 'string'
          : undefined;
      if (type === undefined) {
        throw new Error(`Option not configured: "${key}"`);
      }
      return [key, { description, aliases, type }];
    }),
  );
}
