import { log } from 'node:console';
import process from 'node:process';

import { gracefulExit } from '@simbo/graceful-exit';

import type { ClirkContext, ClirkOptions } from './clirk.types.js';
import { addFlagsToOptions } from './lib/add-flags-to-options.js';
import { createClirkContext } from './lib/create-clirk-context.js';
import { generateHelpMessage } from './lib/generate-help-message.js';
import { generateVersionMessage } from './lib/generate-version-message.js';
import { isFlagDefined } from './lib/is-flag-defined.js';

/**
 * clirk - The CLI Clerk.
 * This function initializes the CLI clerk with the provided options.
 * It parses arguments, provides CLI package information and takes over common
 * CLI tasks like generating help messages, displaying version information, and
 * handling SIGINT.
 *
 * @param cliOptions - The options for clirk.
 * @returns A promise that resolves to the ClirkContext, which contains the
 * parsed arguments and options as well as CLI package information.
 */
export async function clirk(cliOptions: ClirkOptions): Promise<ClirkContext> {
  const helpHandledByUser = isFlagDefined(cliOptions.argsOptions, 'help');
  const versionHandledByUser = isFlagDefined(cliOptions.argsOptions, 'version');

  cliOptions = addFlagsToOptions(cliOptions, {
    help: !helpHandledByUser,
    version: !versionHandledByUser,
  });

  const partialContext = await createClirkContext(cliOptions);

  const getHelpMessage = (): string => generateHelpMessage(partialContext);
  const getVersionMessage = (): string => generateVersionMessage(partialContext);

  const context: ClirkContext = {
    ...partialContext,
    getHelpMessage,
    getVersionMessage,
  };

  if (typeof context.sigintHandler === 'function' && !process.listenerCount('SIGINT')) {
    process.on('SIGINT', context.sigintHandler);
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
