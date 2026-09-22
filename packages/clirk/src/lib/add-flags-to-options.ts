import type { ParsedOptions } from '../schemas/options-schema.js';

const FLAGS = ['help', 'version'] as const;

const FLAG_DESCRIPTIONS: Record<string, string[]> = {
  help: ['Display this help message.'],
  version: ['Display the package name and version.'],
};

/**
 * Adds common CLI flags (e.g. --help, --version) to the Clirk options (in-place).
 *
 * This injects their flag definitions, aliases, and descriptions into the
 * minimist options and help text maps.
 *
 * @param options - The parsed Clirk options.
 * @param flags - A map of built-in flags to enable (e.g. `{ help: true }`).
 */
export function addFlagsToOptions(options: ParsedOptions, flags: Record<string, boolean> = {}): void {
  for (const flag of FLAGS) {
    if (!flags[flag]) {
      continue;
    }

    options.argsOptions.boolean = [...new Set([...options.argsOptions.boolean, flag])];
    options.argsOptions.alias[flag] = [...(options.argsOptions.alias[flag] ?? []), flag[0]];
    if (!Object.hasOwn(options.options, flag)) {
      options.options[flag] = FLAG_DESCRIPTIONS[flag];
    }
  }
}
