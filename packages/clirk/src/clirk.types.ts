import type { PackageNormalized } from '@simbo/find-up-package';
import type { Opts, ParsedArgs } from 'minimist';

/**
 * The options for clirk.
 */
export interface ClirkOptions {
  /**
   * The `import.meta` from any script within the CLI package.
   * This is used to resolve the CLI package information.
   */
  importMeta: ImportMeta;

  /**
   * The options for parsing command line arguments.
   * This is passed to the minimist library.
   * If these options do not include `--help` or `--version`, clirk will take
   * care of this and also take over if the flags are present.
   */
  argsOptions?: Opts;

  /**
   * The printable title of the CLI.
   */
  title: string;

  /**
   * The command name to run the CLI.
   */
  name: string;

  /**
   * An optional icon for the CLI.
   * This will be displayed in the help message.
   */
  icon?: string;

  /**
   * The description of the CLI.
   * If not provided, it will be derived from the CLI's package.json.
   * Use an array of strings for multiple lines to support indentation.
   */
  description?: string | string[];

  /**
   * Usage examples for the CLI.
   * Use an array of strings for multiple lines to support indentation.
   * Defaults to the command name.
   */
  examples?: string | string[];

  /**
   * Usage instructions for the CLI. Optional, but recommended.
   * Use an array of strings for multiple lines to support indentation.
   */
  usage?: string | string[];

  /**
   * A label for the usage section.
   * If not provided, it will default to "USAGE".
   * This is used in the help message to indicate the usage section.
   */
  usageLabel?: string;

  /**
   * Parameters for the CLI. (Arguments that are not options.)
   * This defines the supported parameters for the CLI for help messages.
   * The keys are the names of the parameters, and the values are their descriptions.
   * Use an array of strings for multiple lines to support indentation.
   */
  parameters?: Record<string, string | string[]>;

  /**
   * A label for the parameters section.
   * If not provided, it will default to "PARAMETERS".
   * This is used in the help message to indicate the parameters section.
   */
  parametersLabel?: string;

  /**
   * Options for the CLI.
   * This defines the supported options for the CLI for help messages.
   * The keys are the names of the options, and the values are their descriptions.
   * Use an array of strings for multiple lines to support indentation.
   */
  options?: Record<string, string | string[]>;

  /**
   * A label for the options section.
   * If not provided, it will default to "OPTIONS".
   * This is used in the help message to indicate the options section.
   */
  optionsLabel?: string;

  /**
   * A function to handle the SIGINT signal (Ctrl+C).
   * If provided, this function will be called when the user presses Ctrl+C.
   * If not provided, clirk will handle the SIGINT signal and exit gracefully.
   * The default message can be customized using the `sigintMessage` option.
   * If set to `false`, clirk will not handle the SIGINT signal.
   */
  sigintHandler?: (() => void) | false;

  /**
   * The message to display when the SIGINT signal (CTRL+C) is received.
   * If not provided, a default message will be used.
   * This option is only used if `sigintHandler` is not set to `false`.
   */
  sigintMessage?: string;
}

/**
 * The context for the clirk CLI.
 */
export interface ClirkContext {
  /**
   * The absolute path to the directory containing the CLI's package.json.
   */
  importPath: string;

  /**
   * The options for parsing command line arguments.
   * This is passed to the minimist library.
   */
  argsOptions: Opts;

  /**
   * The parsed command line arguments.
   * This is the result of calling minimist with the provided argsOptions.
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
  sigintHandler?: () => void;

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

export type ClirkContextWithoutMessages = Omit<ClirkContext, 'getHelpMessage' | 'getVersionMessage'>;

/**
 * A parameter argument for the CLI.
 */
export interface CliParameter {
  /**
   * The description of the parameter argument.
   */
  description: string[];
}

/**
 * An option for the CLI.
 */
export interface CliOption {
  /**
   * The description of the option.
   */
  description: string[];

  /**
   * The aliases for the option.
   * This is a set of strings that can be used as alternative names for the option.
   */
  aliases: Set<string>;

  /**
   * Whether the option is a boolean flag.
   * If true, the option does not require a value and is either present or absent.
   */
  isBoolean: boolean;

  /**
   * Whether the option is a string value.
   * If true, the option requires a string value.
   */
  isString: boolean;
}
