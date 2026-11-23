import { describe, expect, it } from 'vitest';

import { assertConcurrency } from './assert-concurrency.js';

describe('assertConcurrency', () => {
  it.each([1, 2, 10, Number.MAX_SAFE_INTEGER, Infinity])('should accept %s', concurrency => {
    expect(() => {
      assertConcurrency(concurrency);
    }).not.toThrow();
  });

  it.each([
    ['zero', 0],
    ['a negative integer', -1],
    ['negative infinity', -Infinity],
    ['a fraction', 1.5],
    ['NaN', NaN],
    ['an unsafe integer', Number.MAX_SAFE_INTEGER + 1],
    ['a numeric string', '1'],
    ['undefined', undefined],
    ['null', null],
  ])('should reject %s', (_, concurrency) => {
    expect(() => {
      assertConcurrency(concurrency);
    }).toThrow(new TypeError('Concurrency must be a positive integer'));
  });
});
