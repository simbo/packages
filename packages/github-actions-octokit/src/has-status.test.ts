import { describe, expect, it } from 'vitest';

import { hasStatus } from './has-status.js';

describe('hasStatus', () => {
  it('matches an error with the given status', () => {
    const error = Object.assign(new Error('Not Found'), { status: 404 });
    expect(hasStatus(error, 404)).toBe(true);
    expect(hasStatus({ status: 422 }, 422)).toBe(true);
  });

  it('rejects another status', () => {
    expect(hasStatus({ status: 404 }, 422)).toBe(false);
    expect(hasStatus({ status: '404' }, 404)).toBe(false);
  });

  it('rejects values without a status', () => {
    expect(hasStatus(new Error('failed'), 404)).toBe(false);
    expect(hasStatus(null, 404)).toBe(false);
    expect(hasStatus(undefined, 404)).toBe(false);
    expect(hasStatus(404, 404)).toBe(false);
  });
});
