import { debug, setFailed } from '@actions/core';
import { stringifyError } from '@simbo/stringify-error';

import type { ActionMain } from './github-actions-utils.types.js';

/**
 * Builds the failure message of an error, followed by the messages of its causes.
 *
 * @param error - The error, of any type.
 * @returns The message, with one "Caused by:" line per cause.
 */
function failureMessage(error: unknown): string {
  const messages = [stringifyError(error)];
  const seen = new Set<unknown>([error]);
  let current = error;
  while (current instanceof Error && current.cause !== undefined && !seen.has(current.cause)) {
    current = current.cause;
    seen.add(current);
    messages.push(`Caused by: ${stringifyError(current)}`);
  }
  return messages.join('\n');
}

/**
 * Runs the main function of a GitHub Action and reports a failure.
 *
 * If `main` throws or rejects, the action fails through `core.setFailed`: the
 * message of the error and of every cause is logged as an error annotation, and
 * `process.exitCode` is set to 1. The stack trace is logged with `core.debug`,
 * visible only in debug logs. The process is not ended, so pending output and
 * handles complete as usual.
 *
 * @param main - The main function of the action.
 * @returns A promise that resolves when `main` is done; it never rejects.
 */
export async function runAction(main: ActionMain): Promise<void> {
  try {
    await main();
  } catch (error) {
    if (error instanceof Error && error.stack !== undefined) {
      debug(error.stack);
    }
    setFailed(failureMessage(error));
  }
}
