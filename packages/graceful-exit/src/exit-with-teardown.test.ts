import { beforeEach, describe, expect, it, vi } from 'vitest';

import { exitWithTeardown } from './exit-with-teardown.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:process', () => ({
  exit: vi.fn(),
}));

vi.mock('@simbo/cli-output', () => ({
  failure: vi.fn().mockImplementation((msg: string) => `[failure] ${msg}`),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn().mockImplementation((err: unknown) => `[stringified]${String(err)}[/stringified]`),
}));

vi.mock('./teardown/teardown-steps.js', () => ({
  teardownSteps: new Set(),
}));

const { log } = vi.mocked(await import('node:console'));
const { exit } = vi.mocked(await import('node:process'));
const { failure } = vi.mocked(await import('@simbo/cli-output'));
const { stringifyError } = vi.mocked(await import('@simbo/stringify-error'));
const { teardownSteps } = vi.mocked(await import('./teardown/teardown-steps.js'));

describe('exitWithTeardown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    teardownSteps.clear();
  });

  it('simply exits when there are no teardown steps', async () => {
    await exitWithTeardown(0, undefined);

    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenNthCalledWith(1, 0);
    expect(log).not.toHaveBeenCalled();
    expect(failure).not.toHaveBeenCalled();
    expect(stringifyError).not.toHaveBeenCalled();
  });

  it('calls the teardown steps before exiting', async () => {
    const teardownStep = vi.fn().mockReturnValue(undefined);
    teardownSteps.add(teardownStep);
    await exitWithTeardown(0, undefined);

    expect(teardownStep).toHaveBeenCalledTimes(1);
    expect(teardownStep).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenNthCalledWith(1, 0);
    expect(log).not.toHaveBeenCalled();
    expect(failure).not.toHaveBeenCalled();
    expect(stringifyError).not.toHaveBeenCalled();
  });

  it('catches errors from sync and async steps and executes in order', async () => {
    const syncTeardownStep = vi.fn().mockImplementation(() => {
      throw new Error('Sync teardown error');
    });
    const syncSuccessfulStep = vi.fn();
    const asyncTeardownStep = vi.fn().mockRejectedValue(new Error('Async teardown error'));
    teardownSteps.add(syncSuccessfulStep);
    teardownSteps.add(asyncTeardownStep);
    teardownSteps.add(syncTeardownStep);

    const code = 1;
    const error = new Error('Test error');
    await exitWithTeardown(code, error);

    expect(syncSuccessfulStep).toHaveBeenCalledTimes(1);
    expect(syncSuccessfulStep).toHaveBeenNthCalledWith(1, code, error);
    expect(asyncTeardownStep).toHaveBeenCalledTimes(1);
    expect(asyncTeardownStep).toHaveBeenNthCalledWith(1, code, error);
    expect(syncTeardownStep).toHaveBeenCalledTimes(1);
    expect(syncTeardownStep).toHaveBeenNthCalledWith(1, code, error);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenNthCalledWith(
      1,
      '[failure] Error in teardown step: [stringified]Error: Async teardown error[/stringified]',
    );
    expect(log).toHaveBeenNthCalledWith(
      2,
      '[failure] Error in teardown step: [stringified]Error: Sync teardown error[/stringified]',
    );
    expect(failure).toHaveBeenCalledTimes(2);
    expect(stringifyError).toHaveBeenCalledTimes(2);
  });

  it('should change the error code when a teardown step fails during a successful exit', async () => {
    const asyncTeardownStep = vi.fn().mockRejectedValue(new Error('Async teardown error'));
    teardownSteps.add(asyncTeardownStep);
    const code = 0;
    await exitWithTeardown(code, undefined);

    expect(asyncTeardownStep).toHaveBeenCalledTimes(1);
    expect(asyncTeardownStep).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(1);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(
      1,
      '[failure] Error in teardown step: [stringified]Error: Async teardown error[/stringified]',
    );
    expect(failure).toHaveBeenCalledTimes(1);
    expect(stringifyError).toHaveBeenCalledTimes(1);
  });
});
