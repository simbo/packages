import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockContext } from '../../tests/mocks.js';

import * as defaults from './options-defaults.js';

vi.mock('@simbo/graceful-exit', () => ({
  gracefulExit: vi.fn(),
}));

vi.mock('@simbo/cli-output', () => ({
  terminated: vi.fn().mockImplementation((msg: string) => `[terminated] ${msg}`),
}));

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

const { gracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));
const { log } = vi.mocked(await import('node:console'));

describe('Default Options', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_SIGINT_HANDLER', () => {
    it('calls gracefulExit', async () => {
      const context = mockContext();
      await defaults.DEFAULT_SIGINT_HANDLER(context);
      expect(gracefulExit).toHaveBeenCalledTimes(1);
      expect(gracefulExit).toHaveBeenCalledWith(undefined, 1);
      expect(log).toHaveBeenCalledTimes(1);
      expect(log).toHaveBeenCalledWith('[terminated] Received SIGINT');
    });
  });
});
