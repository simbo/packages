import type { PackageNormalized } from '@simbo/find-up-package';
import type { ParsedArgs } from 'minimist';

import type { ParsedMinimistOptions } from '../schemas/minimist-options-schema.js';

/**
 * The context for the clirk CLI.
 */
export interface ClirkContext {
  /**
   * The absolute path to the directory containing the CLI's package.json.
   */
  importPath: string;

  /**
   * The parsed options that were passed to minimist.
   */
  argsOptions: ParsedMinimistOptions;

  /**
   * The parsed command line arguments from minimist.
   */
  args: ParsedArgs;

  /**
   * The printable title of the CLI.
   */
  title: string;

  /**
   * The command name of the CLI.
   */
  name: string;

  /**
   * An optional icon for the CLI.
   */
  icon?: string;

  /**
   * The package information of the CLI.
   * This is derived from the package.json file in the CLI's directory.
   */
  package: PackageNormalized;

  /**
   * The actual command name extracted from `process.argv`.
   */
  commandName: string;

  /**
   * The description of the CLI.
   */
  description: string[];

  /**
   * Usage examples for the CLI.
   */
  examples: string[];

  /**
   * Usage instructions for the CLI.
   */
  usage: string[];

  /**
   * A label for the usage section.
   * This is used in the help message to indicate the usage section.
   */
  usageLabel: string;

  /**
   * The parameters for the CLI.
   * This is a map of parameter names to their descriptions.
   */
  parameters: Map<string, CliParameter>;

  /**
   * A label for the parameters section.
   * This is used in the help message to indicate the parameters section.
   */
  parametersLabel: string;

  /**
   * The options for the CLI.
   * This is a map of option names to their descriptions and properties.
   */
  options: Map<string, CliOption>;

  /**
   * A label for the options section.
   * This is used in the help message to indicate the options section.
   */
  optionsLabel: string;

  /**
   * The function to handle the SIGINT signal (Ctrl+C).
   * If undefined, clirk will not handle the SIGINT signal.
   */
  sigintHandler: SigIntHandler | false;

  /**
   * The message to display when the SIGINT signal (CTRL+C) is received.
   * This is either a custom message provided by the user or a default message.
   */
  sigintMessage: string;

  /**
   * Generates a help message for the CLI.
   * This includes the title, description, usage, examples, parameters, and options.
   */
  getHelpMessage: () => string;

  /**
   * Generates a version message for the CLI.
   * This includes the package name and version.
   */
  getVersionMessage: () => string;
}

/**
 * The Clirk context before handlers for help and version messages are added.
 */
export type ClirkContextWithoutMessages = Omit<ClirkContext, 'getHelpMessage' | 'getVersionMessage'>;

/**
 * A parameter for the CLI.
 */
export interface CliParameter {
  /**
   * The description of the parameter.
   */
  description: string[];
}

/**
 * An option of the CLI.
 */
export interface CliOption {
  /**
   * The description of the option.
   */
  description: string[];

  /**
   * The aliases for the option.
   */
  aliases: Set<string>;

  /**
   * Whether the option is a boolean or a string flag.
   */
  type: 'boolean' | 'string';
}

/**
 * A function to handle the SIGINT signal (Ctrl+C).
 */
export type SigIntHandler = (context: ClirkContext) => void | Promise<void>;
