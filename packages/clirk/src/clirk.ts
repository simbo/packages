import { log } from 'node:console';

import { gracefulExit } from '@simbo/graceful-exit';

import { addFlagsToOptions } from './lib/add-flags-to-options.js';
import { applySigintHandler } from './lib/apply-sigint-handler.js';
import { createClirkContext } from './lib/create-clirk-context.js';
import { generateHelpMessage } from './lib/generate-help-message.js';
import { generateVersionMessage } from './lib/generate-version-message.js';
import type { ParsedOptions } from './schemas/options-schema.js';
import { validateOptions } from './schemas/validate-options.js';
import type { ClirkContext } from './types/clirk-context.interface.js';
import type { ClirkOptions } from './types/clirk-options.interface.js';

/**
 * clirk - The CLI Clerk.
 *
 * This function initializes a CLI with the provided options.
 * It parses arguments, provides CLI package information and takes over common
 * CLI tasks like generating help messages, displaying version information, and
 * handling SIGINT.
 *
 * @param cliOptions - The options for clirk.
 * @returns A promise that resolves to the ClirkContext, which contains the
 * parsed arguments and options as well as CLI package information.
 */
export async function clirk(cliOptions: ClirkOptions): Promise<ClirkContext> {
  const parsedOptions: ParsedOptions = validateOptions(cliOptions);

  const helpHandledByUser = parsedOptions.argsOptions.boolean.includes('help');
  const versionHandledByUser = parsedOptions.argsOptions.boolean.includes('version');

  addFlagsToOptions(parsedOptions, {
    help: !helpHandledByUser,
    version: !versionHandledByUser,
  });

  const partialContext = await createClirkContext(parsedOptions);

  const getHelpMessage = (): string => generateHelpMessage(partialContext);
  const getVersionMessage = (): string => generateVersionMessage(partialContext);

  const context: ClirkContext = {
    ...partialContext,
    getHelpMessage,
    getVersionMessage,
  };

  if (typeof context.sigintHandler === 'function') {
    applySigintHandler(context);
  }

  if (!helpHandledByUser && context.args.help) {
    log(context.getHelpMessage());
    return gracefulExit();
  }

  if (!versionHandledByUser && context.args.version) {
    log(context.getVersionMessage());
    return gracefulExit();
  }

  return context;
}
