import { describe, expect, it } from 'vitest';

import { plural } from './plural.js';

describe('plural', () => {
  it('keeps replacement tokens in words literal', () => {
    expect(plural(1, '$& $$')).toBe('1 $& $$');
    expect(plural(2, 'item', '$& $$')).toBe('2 $& $$');
  });

  it('uses singular form for count === 1', () => {
    expect(plural(1, 'apple')).toBe('1 apple');
  });

  it('uses plural form for count > 1', () => {
    expect(plural(3, 'apple')).toBe('3 apples');
  });

  it('uses plural form for count === 0', () => {
    expect(plural(0, 'file')).toBe('0 files');
  });

  it('uses plural form for count < -1', () => {
    expect(plural(-2, 'task')).toBe('-2 tasks');
  });

  it('uses singular form for count === -1', () => {
    expect(plural(-1, 'task')).toBe('-1 task');
  });

  it('uses custom plural word if provided', () => {
    expect(plural(2, 'person', 'people')).toBe('2 people');
  });

  it('uses custom template and replaces only first %d and %s', () => {
    const result = plural(5, 'cat', undefined, '%d %s (%d %s)');
    expect(result).toBe('5 cats (%d %s)');
  });

  it('handles templates with missing %d or %s gracefully', () => {
    expect(plural(2, 'entry', 'entries', 'entries: %s')).toBe('entries: entries');
    expect(plural(2, 'entry', 'entries', 'count: %d')).toBe('count: 2');
  });

  it('appends "s" to singular if plural not provided', () => {
    expect(plural(2, 'car')).toBe('2 cars');
  });

  it('keeps negative count in output', () => {
    expect(plural(-3, 'error')).toBe('-3 errors');
  });

  it('handles string count input', () => {
    expect(plural('4', 'item')).toBe('4 items');
    expect(plural('1', 'item')).toBe('1 item');
    expect(plural('0', 'item')).toBe('0 items');
  });

  it('returns empty string for empty count', () => {
    expect(plural('', 'item')).toBe('0 items');
  });

  it('returns empty string for null count', () => {
    expect(plural(null as unknown as string, 'item')).toBe('0 items');
  });

  it('returns empty string for undefined count', () => {
    expect(plural(undefined as unknown as string, 'item')).toBe('0 items');
  });

  it('should support templates from plural output', () => {
    const result = plural(4, 'File', undefined, plural(2, 'Directory', 'Directories', '%d %s (%d %s)'));
    expect(result).toBe('2 Directories (4 Files)');
  });
});
