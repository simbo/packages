import type { SigIntHandler } from './clirk-context.interface.js';
import type { MinimistOptions } from './minimist-options.interface.js';

/**
 * The options for clirk.
 */
export interface ClirkOptions {
  /**
   * The `import.meta.dirname` from any script within the CLI package.
   * This is used to resolve the CLI package information.
   */
  importMetaDirname: string;

  /**
   * The options for parsing command line arguments.
   * This is passed to the minimist library.
   * If these options do not include `--help` or `--version`, clirk will take
   * care of this and also take over if the flags are present.
   */
  argsOptions?: MinimistOptions;

  /**
   * The printable title of the CLI.
   */
  title: string;

  /**
   * The command name to run the CLI.
   */
  name?: string;

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
  sigintHandler?: SigIntHandler | false;

  /**
   * The message to display when the SIGINT signal (CTRL+C) is received.
   * If not provided, a default message will be used.
   * This option is only used if `sigintHandler` is not set to `false`.
   */
  sigintMessage?: string;
}
