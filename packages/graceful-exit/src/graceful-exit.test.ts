import { UserFacingError } from '@simbo/user-facing-error';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { gracefulExit } from './graceful-exit.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('@simbo/cli-output', () => ({
  failure: vi.fn().mockImplementation((msg: string) => `[failure] ${msg}`),
  hintToHelp: vi.fn().mockImplementation(() => 'Call --help.'),
  terminated: vi.fn().mockImplementation((msg: string) => `[terminated] ${msg}`),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn().mockImplementation((err: unknown) => `[stringified]${String(err)}[/stringified]`),
}));

vi.mock('./exit-with-teardown.js', () => ({
  exitWithTeardown: vi.fn(),
}));

vi.mock('yoctocolors', () => ({
  dim: (text: string) => `[dimmed]${text}[/dimmed]`,
}));

const { log } = vi.mocked(await import('node:console'));
const { exitWithTeardown } = vi.mocked(await import('./exit-with-teardown.js'));

describe('gracefulExit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exits with 0 when undefined is passed', async () => {
    await gracefulExit();

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenNthCalledWith(1, 0, undefined);
    expect(log).not.toHaveBeenCalled();
  });

  it('exits with 0 when null is passed', async () => {
    await gracefulExit(null);

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenNthCalledWith(1, 0, null);
    expect(log).not.toHaveBeenCalled();
  });

  it('exits with given number code', async () => {
    await gracefulExit(2);

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenNthCalledWith(1, 2, 2);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(1, '[failure] Exiting. [dimmed](Error #2)[/dimmed]');
  });

  it('handles user-facing errors', async () => {
    await gracefulExit(new UserFacingError('Something went wrong.', 'Check yourself.'));

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenCalledWith(1, expect.any(UserFacingError));
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenNthCalledWith(1, '[failure] Something went wrong.');
    expect(log).toHaveBeenNthCalledWith(2, '[dimmed]Check yourself.[/dimmed]');
  });

  it('logs user-facing error with default hint', async () => {
    await gracefulExit(new UserFacingError('Something went wrong.', true));

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenCalledWith(1, expect.any(UserFacingError));
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenNthCalledWith(1, '[failure] Something went wrong.');
    expect(log).toHaveBeenNthCalledWith(2, '[dimmed]Call --help.[/dimmed]');
  });

  it('stringifies unknown errors', async () => {
    await gracefulExit('unexpected');

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenNthCalledWith(1, 1, 'unexpected');
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(1, '[failure] [stringified]unexpected[/stringified]');
  });

  it('logs ExitPromptError message and exits with 1', async () => {
    const err = new Error('ExitPromptError');
    err.name = 'ExitPromptError';
    await gracefulExit(err);

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenCalledWith(1, expect.any(Error));
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(1, '[terminated] Prompt Cancelled');
  });

  it('exits with custom code when provided', async () => {
    await gracefulExit(new Error('Custom error'), 2);

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenCalledWith(2, expect.any(Error));
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(1, '[failure] [stringified]Error: Custom error[/stringified]');
  });

  it('exits with custom code and no output if no error is provided', async () => {
    await gracefulExit(undefined, 2);

    expect(exitWithTeardown).toHaveBeenCalledTimes(1);
    expect(exitWithTeardown).toHaveBeenCalledWith(2, undefined);
    expect(log).not.toHaveBeenCalled();
  });
});
