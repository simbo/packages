import { describe, expect, it, vi } from 'vitest';

import { clitch } from './clitch.js';

vi.mock('@simbo/graceful-exit', () => ({
  gracefulExit: vi.fn(),
}));

const { gracefulExit } = vi.mocked(await import('@simbo/graceful-exit'));

describe('clitch', () => {
  it('calls cliFn and exits gracefully without error', async () => {
    const fn = vi.fn();
    await clitch(fn);

    expect(fn).toHaveBeenCalledWith(expect.any(String));
    expect(gracefulExit).toHaveBeenCalledWith();
  });

  it('calls gracefulExit with error on exception', async () => {
    const err = new Error('test failure');
    const fn = vi.fn().mockImplementation(() => {
      throw err;
    });

    await clitch(fn);

    expect(gracefulExit).toHaveBeenCalledWith(err);
  });

  it('supports async functions', async () => {
    const fn = vi.fn().mockResolvedValue(undefined);
    await clitch(fn);

    expect(fn).toHaveBeenCalled();
    expect(gracefulExit).toHaveBeenCalledWith();
  });
});
