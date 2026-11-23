import { beforeEach, describe, expect, it, vi } from 'vitest';

import { onTeardown } from './on-teardown.js';

vi.mock('./teardown-steps.js', () => ({
  teardownSteps: new Set(),
}));

const { teardownSteps } = vi.mocked(await import('./teardown-steps.js'));

describe('onTeardown', () => {
  beforeEach(() => {
    teardownSteps.clear();
  });

  it('adds a function to the set to teardown steps', () => {
    const fn = (): void => {};
    expect(teardownSteps).not.toContain(fn);
    expect(teardownSteps.size).toBe(0);
    onTeardown(fn);
    expect(teardownSteps).toContain(fn);
    expect(teardownSteps.size).toBe(1);
  });
});
