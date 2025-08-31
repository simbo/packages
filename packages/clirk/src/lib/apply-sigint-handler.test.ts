import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { mockContext } from '../../tests/mocks.js';
import type { ClirkContext } from '../types/clirk-context.interface.js';

import { applySigintHandler } from './apply-sigint-handler.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:process', () => ({
  default: { on: vi.fn() },
}));

vi.mock('@simbo/graceful-exit', () => ({
  looseGracefulExit: vi.fn(),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn().mockImplementation((error: unknown) => `[stringified] ${String(error)}`),
}));

vi.mock('@simbo/cli-output', () => ({
  failure: vi.fn().mockImplementation((msg: string) => `[failure] ${msg}`),
}));

vi.mock('../schemas/options-defaults.js', () => ({
  DEFAULT_MINIMIST_OPTIONS: { string: [], boolean: [], alias: {}, default: {} },
  DEFAULT_USAGE_LABEL: 'USAGE',
  DEFAULT_PARAMETERS_LABEL: 'PARAMETERS',
  DEFAULT_OPTIONS_LABEL: 'OPTIONS',
  DEFAULT_SIGINT_MESSAGE: '[terminated] Received SIGINT',
  DEFAULT_SIGINT_HANDLER: vi.fn(),
}));

const {
  default: { on },
} = vi.mocked(await import('node:process')) as unknown as { default: { on: Mock } };
const { log } = vi.mocked(await import('node:console'));
const { looseGracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));

const handler = vi.fn();

on.mockImplementation((_event: never, listener: () => void) => {
  handler.mockReset().mockImplementation(listener);
});

describe('applySigintHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers a sigint handler', async () => {
    const context = mockContext();
    applySigintHandler(context);
    expect(on).toHaveBeenCalledTimes(1);
    expect(on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(handler).not.toHaveBeenCalled();
    expect(looseGracefulExit).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  describe('Handler Function', () => {
    let context: ClirkContext;

    beforeEach(() => {
      context = mockContext();
      applySigintHandler(context);
      expect(on).toHaveBeenCalledTimes(1);
      expect(on).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    });

    it('calls the handler', async () => {
      handler();
      expect(handler).toHaveBeenCalledTimes(1);
      await new Promise(globalThis.setImmediate);
      expect(context.sigintHandler).toHaveBeenCalledTimes(1);
      expect(looseGracefulExit).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    });

    it('handles errors from the handler', async () => {
      const error = new Error('Test error');
      (context.sigintHandler as Mock).mockImplementationOnce(() => {
        throw error;
      });
      handler();
      expect(handler).toHaveBeenCalledTimes(1);
      await new Promise(globalThis.setImmediate);
      expect(context.sigintHandler).toHaveBeenCalledTimes(1);
      expect(looseGracefulExit).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith(`[failure] Error while handling SIGINT: [stringified] ${String(error)}`);
    });
  });
});
