import { log } from 'node:console';
import { on } from 'node:process';

import { failure } from '@simbo/cli-output';
import { looseGracefulExit } from '@simbo/graceful-exit';
import { stringifyError } from '@simbo/stringify-error';

import type { ClirkContext, SigIntHandler } from '../types/clirk-context.interface.js';

/**
 * Applies the SIGINT handler to the process.
 *
 * @param context - The Clirk context.
 */
export function applySigintHandler(context: ClirkContext): void {
  on('SIGINT', () => {
    (async () => {
      await (context.sigintHandler as SigIntHandler)(context);
    })().catch((error: unknown) => {
      log(failure(`Error while handling SIGINT: ${stringifyError(error)}`));
      looseGracefulExit(undefined, 1);
    });
  });
}
