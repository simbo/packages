import { log } from 'node:console';
import { basename } from 'node:path';
import { argv } from 'node:process';

import { terminated } from '@simbo/cli-output';
import { findUpPackage } from '@simbo/find-up-package';
import { gracefulExit } from '@simbo/graceful-exit';
import { importMetaPath } from '@simbo/import-meta-path';
import minimist from 'minimist';

import type { CliOption, CliParameter, ClirkContextWithoutMessages, ClirkOptions } from '../clirk.types.js';

import { parseStringInput } from './parse-string-input.js';

/**
 * Creates a ClirkContext based on the provided CLI options.
 *
 * This sets up the runtime context needed by clirk, including:
 * - reading the CLI's own package.json
 * - parsing CLI arguments using minimist
 * - normalizing description, examples, usage, parameters, and options
 * - resolving aliases and flag types (boolean/string)
 *
 * @param cliOptions - The user-supplied options for the CLI definition.
 * @returns A promise that resolves to a ClirkContextWithoutMessages object.
 * @throws If `importMeta` is not provided.
 */
export async function createClirkContext(cliOptions: ClirkOptions): Promise<ClirkContextWithoutMessages> {
  if (!cliOptions.importMeta) {
    throw new Error('The importMeta option is required.');
  }

  const importPath = importMetaPath(cliOptions.importMeta);

  const pkg = await findUpPackage({
    workingDir: importPath,
    normalize: true,
  });

  if (pkg === undefined) {
    throw new Error(`Could not find package for path: ${importPath}`);
  }

  const commandName = basename(argv[1]);

  const {
    argsOptions = {},
    title,
    name,
    description = pkg.packageJson.description,
    icon,
    usage = [],
    usageLabel = 'USAGE',
    parametersLabel = 'PARAMETERS',
    optionsLabel = 'OPTIONS',
  } = cliOptions;

  const args = minimist(argv.slice(2), argsOptions);
  const parameters = getParametersMap(cliOptions);
  const options = getOptionsMap(cliOptions);
  const examples = getExamples(cliOptions);
  const { sigintHandler, sigintMessage } = getSigintHandler(cliOptions);

  return {
    importPath,
    argsOptions,
    args,
    title,
    name,
    commandName,
    package: pkg,
    description: parseStringInput(description),
    examples,
    usage: parseStringInput(usage),
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
 * Parses the parameters from the CLI options.
 *
 * This function extracts the parameters and their descriptions from the `parameters`
 * field of the CLI options.
 *
 * @param cliOptions - The user-supplied options for the CLI definition.
 * @returns A Map of parameter names to their descriptions.
 */
function getParametersMap(cliOptions: ClirkOptions): Map<string, CliParameter> {
  const { parameters = {} } = cliOptions;
  return new Map(Object.entries(parameters).map(([key, value]) => [key, { description: parseStringInput(value) }]));
}

/**
 * Parses the options from the CLI options.
 *
 * This function extracts the options and their properties from the `options`
 * and `argsOptions` fields of the CLI options.
 *
 * @param cliOptions - The user-supplied options for the CLI definition.
 * @returns A Map of option names to their descriptions and properties.
 */
function getOptionsMap(cliOptions: ClirkOptions): Map<string, CliOption> {
  const { argsOptions = {}, options = {} } = cliOptions;
  return new Map(
    Object.entries(options).map(([key, value]) => {
      const optionDescription = parseStringInput(value);
      const aliases = argsOptions.alias?.[key]
        ? new Set<string>(Array.isArray(argsOptions.alias[key]) ? argsOptions.alias[key] : [argsOptions.alias[key]])
        : new Set<string>();
      const isBoolean =
        argsOptions.boolean === true || (Array.isArray(argsOptions.boolean) && argsOptions.boolean.includes(key));
      const isString = Array.isArray(argsOptions.string) && argsOptions.string.includes(key);
      return [key, { description: optionDescription, aliases, isBoolean, isString }];
    }),
  );
}

/**
 * Parses the examples from the CLI options.
 *
 * If no examples are provided, it defaults to using the command name.
 * If examples are provided as a string, they are split into an array.
 *
 * @param cliOptions - The user-supplied options for the CLI definition.
 * @returns An array of example strings.
 */
function getExamples(cliOptions: ClirkOptions): string[] {
  const { name, examples = [] } = cliOptions;
  const parsedExamples = parseStringInput(examples);
  return parsedExamples.length === 0 ? [name] : parsedExamples;
}

/**
 * Returns the SIGINT handler and message based on the provided CLI options.
 *
 * If a custom handler function is provided, it will be used.
 * If `sigintHandler` is set to false, no handler will be created.
 * If no custom handler is provided, a default handler will log a message and
 * exit gracefully.
 *
 * @param cliOptions - The user-supplied options for the CLI definition.
 * @returns An object containing the sigintHandler function and sigintMessage
 * string.
 */
function getSigintHandler(cliOptions: ClirkOptions): { sigintHandler?: () => void; sigintMessage: string } {
  const { sigintHandler: fn, sigintMessage: msg } = cliOptions;
  const sigintMessage = typeof msg === 'string' && msg.length > 0 ? msg : terminated('Received SIGINT');
  const sigintHandler =
    fn === false
      ? undefined
      : typeof fn === 'function'
        ? fn
        : async () => {
            log(sigintMessage);
            await gracefulExit(undefined, 1);
          };
  return { sigintHandler, sigintMessage };
}
