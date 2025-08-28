import { log } from 'node:console';
import { exit } from 'node:process';

import { stringifyError } from '@simbo/stringify-error';

import { gracefulExit } from './graceful-exit.js';

/**
 * A sync wrapper for gracefulExit that does not await the promised return but
 * just fire and handle the async exit.
 *
 * Useful for situations where you are in a sync context and need to trigger an
 * async exit.
 *
 * @param error - An optional error to log before exiting. If not provided,
 * the process will exit with the specified code.
 * @param exitCode - The exit code to use. Defaults to 1 if there's an error,
 * or 0 if the exit is successful.
 */
export function looseGracefulExit(error?: unknown, exitCode?: number): void {
  gracefulExit(error, exitCode).catch((exitError: unknown) => {
    log(`Error during graceful exit: ${stringifyError(exitError)}`);
    exit(1);
  });
}
