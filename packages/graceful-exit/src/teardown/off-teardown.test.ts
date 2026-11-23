import { beforeEach, describe, expect, it, vi } from 'vitest';

import { offTeardown } from './off-teardown.js';

vi.mock('./teardown-steps.js', () => ({
  teardownSteps: new Set(),
}));

const { teardownSteps } = vi.mocked(await import('./teardown-steps.js'));

describe('offTeardown', () => {
  beforeEach(() => {
    teardownSteps.clear();
  });

  it('adds a function to the set to teardown steps', () => {
    const fn = (): void => {};
    expect(teardownSteps).not.toContain(fn);
    expect(teardownSteps.size).toBe(0);
    teardownSteps.add(fn);
    expect(teardownSteps).toContain(fn);
    expect(teardownSteps.size).toBe(1);
    offTeardown(fn);
    expect(teardownSteps).not.toContain(fn);
    expect(teardownSteps.size).toBe(0);
  });
});
