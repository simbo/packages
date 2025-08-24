import { log } from 'node:console';
import { exit } from 'node:process';

import { failure } from '@simbo/cli-output';
import { stringifyError } from '@simbo/stringify-error';

import { teardownSteps } from './teardown/teardown-steps.js';

/**
 * Exits the process with a given code after executing all registered teardown steps.
 *
 * @param code - The exit code.
 * @param error - The error that caused the exit.
 * @returns A promise that resolves when the process is ready to exit.
 */
export async function exitWithTeardown(code: number, error: unknown): Promise<never> {
  if (teardownSteps.size === 0) {
    return exit(code);
  }

  for (const step of teardownSteps) {
    try {
      await step(code, error);
    } catch (error_: unknown) {
      log(failure(`Error in teardown step: ${stringifyError(error_)}`));
      code = code === 0 ? 1 : code;
    }
  }

  exit(code);
}
