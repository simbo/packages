import { log } from 'node:console';

import { failure, hintToHelp, terminated } from '@simbo/cli-output';
import { stringifyError } from '@simbo/stringify-error';
import { UserFacingError } from '@simbo/user-facing-error';
import { dim } from 'yoctocolors';

import { exitWithTeardown } from './exit-with-teardown.js';

/**
 * Gracefully exit a process with pretty output depending on the error type and
 * optional async teardown.
 *
 * This exit handles:
 * - default exits (no error)
 * - error code exits
 * - inquirer.js prompt exits
 * - user facing errors
 * - unknown errors
 *
 * @param error - An optional error to log before exiting. If not provided,
 * the process will exit with the specified code.
 * @param exitCode - The exit code to use. Defaults to 1 if there's an error,
 * or 0 if the exit is successful.
 * @returns A void with no return value. This exits the process.
 */
export async function gracefulExit(error?: unknown, exitCode?: number): Promise<never> {
  // everything that is not undefined or null is considered an error
  const withError = error !== undefined && error !== null;

  // we either return the specified exit code or
  // - if the error is a number and not zero, we use that as the exit code
  // - otherwise, we use 1 in the case of an error, or 0 if successful
  const code = exitCode ?? (typeof error === 'number' && error !== 0 ? error : withError ? 1 : 0);

  // log the error if it exists
  if (withError) {
    logError(error);
  }

  return exitWithTeardown(code, error);
}

/**
 * Logs an error message to the console.
 *
 * @param error - The error to log.
 */
function logError(error: unknown): void {
  // if the error is a number, we log a helpful message
  if (typeof error === 'number') {
    log(failure(`Exiting. ${dim(`(Error #${error})`)}`));
  }

  // if the error is an ExitPromptError from inquirer.js, we log a helpful message
  else if (typeof error === 'object' && (error as Error).name === 'ExitPromptError') {
    log(terminated('Prompt Cancelled'));
  }

  // if the error is an UserFacingError, we log the message and the optional hint
  else if (error instanceof UserFacingError) {
    log(failure(error.message));
    if (error.hint) {
      log(dim(typeof error.hint === 'string' ? error.hint : hintToHelp()));
    }
  }

  // everything else is logged as stringified error
  else {
    log(failure(stringifyError(error)));
  }
}
