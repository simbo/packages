import { beforeEach, describe, expect, it, vi } from 'vitest';

import { looseGracefulExit } from './loose-graceful-exit.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:process', () => ({
  exit: vi.fn(),
}));

vi.mock('./graceful-exit.js', () => ({
  gracefulExit: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn().mockImplementation((err: unknown) => `[stringified]${String(err)}[/stringified]`),
}));

const { log } = vi.mocked(await import('node:console'));
const { exit } = vi.mocked(await import('node:process'));
const { gracefulExit } = vi.mocked(await import('./graceful-exit.js'));
const { stringifyError } = vi.mocked(await import('@simbo/stringify-error'));

describe('looseGracefulExit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls gracefulExit with default values', () => {
    looseGracefulExit();

    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenNthCalledWith(1, undefined, undefined);
    expect(log).not.toHaveBeenCalled();
    expect(stringifyError).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('calls gracefulExit with error values', () => {
    const error = new Error('Test error');
    looseGracefulExit(error, 2);

    expect(gracefulExit).toHaveBeenCalledTimes(1);
    expect(gracefulExit).toHaveBeenNthCalledWith(1, error, 2);
    expect(log).not.toHaveBeenCalled();
    expect(stringifyError).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('catches errors from gracefulExit', async () => {
    const error = new Error('Test error');
    gracefulExit.mockRejectedValueOnce(error);
    looseGracefulExit();

    await new Promise(globalThis.setImmediate);

    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenNthCalledWith(1, 'Error during graceful exit: [stringified]Error: Test error[/stringified]');
    expect(stringifyError).toHaveBeenCalledTimes(1);
    expect(stringifyError).toHaveBeenNthCalledWith(1, error);
    expect(exit).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenNthCalledWith(1, 1);
  });
});
