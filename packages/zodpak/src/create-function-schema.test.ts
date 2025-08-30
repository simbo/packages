/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable unicorn/consistent-function-scoping */
import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';

import { createFunctionSchema } from './create-function-schema.js';

describe('createFunctionSchema', () => {
  it('returns a Zod schema that accepts any function', () => {
    const schema = createFunctionSchema();

    const f1 = (): number => 123;
    const f2 = function named(x: number): boolean {
      return x > 0;
    };

    async function f3(a: string): Promise<number> {
      return a.length;
    }

    function* f4(): Generator<number> {
      yield 1;
    }

    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const f5 = new Function('a', 'b', 'return a + b');

    expect(schema.parse(f1)).toBe(f1);
    expect(schema.parse(f2)).toBe(f2);
    expect(schema.parse(f3)).toBe(f3 as unknown as (...args: unknown[]) => unknown);
    expect(schema.parse(f4)).toBe(f4 as unknown as (...args: unknown[]) => unknown);
    expect(schema.parse(f5)).toBe(f5 as unknown as (...args: unknown[]) => unknown);

    // safeParse happy paths
    expect(schema.safeParse(f1).success).toBe(true);
    expect(schema.safeParse(f2).success).toBe(true);
    expect(schema.safeParse(f3).success).toBe(true);
    expect(schema.safeParse(f4).success).toBe(true);
    expect(schema.safeParse(f5).success).toBe(true);
  });

  it('rejects non-functions with the default error message', () => {
    const schema = createFunctionSchema(); // default "Expected a function"

    for (const value of [null, undefined, 0, 1, '', 'fn', true, false, {}, [], new Date(), /re/]) {
      const res = schema.safeParse(value as unknown);
      expect(res.success).toBe(false);
      if (!res.success) {
        // z.custom emits code "custom"
        expect(res.error.issues[0]?.code).toBe('custom');
        expect(res.error.issues[0]?.message).toBe('Expected a function');
      }
    }
  });

  it('uses a custom error message when provided', () => {
    const schema = createFunctionSchema('Nope, not a function');
    const res = schema.safeParse(123 as unknown);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues[0]?.message).toBe('Nope, not a function');
    }
  });

  it('does not execute the function during validation', () => {
    let called = 0;
    const fn = (): string => {
      called += 1;
      return 'ok';
    };

    const schema = createFunctionSchema<typeof fn>();
    const parsed = schema.parse(fn);

    // The returned value is the same reference and was not called.
    expect(parsed).toBe(fn);
    expect(called).toBe(0);
  });

  it('preserves the provided function type for parse/safeParse results (type-level)', () => {
    type F = (a: number, b: string) => Promise<boolean>;
    const schema = createFunctionSchema<F>();

    // Runtime check still only checks typeof === 'function'
    const f: F = async (a, b) => a > b.length;
    const parsed = schema.parse(f);

    // Runtime: identity
    expect(parsed).toBe(f);

    // Type-level: parsed is F; input is F
    expectTypeOf(parsed).toEqualTypeOf<F>();
    expectTypeOf<ReturnType<typeof schema.parse>>().toEqualTypeOf<F>();

    // safeParse data type is also F on success
    const ok = schema.safeParse(f);
    if (ok.success) {
      expectTypeOf(ok.data).toEqualTypeOf<F>();
    } else {
      expect.unreachable('Expected success');
    }
  });

  it('works when composed in other schemas (e.g., object property)', () => {
    const fnSchema = createFunctionSchema<() => number>();

    const container = z.object({
      handler: fnSchema,
      name: z.string(),
    });

    const handler = (): number => 7;
    const value = { handler, name: 'demo' };

    expect(container.parse(value)).toEqual(value);

    const bad = container.safeParse({ handler: 123, name: 'demo' });
    expect(bad.success).toBe(false);
    if (!bad.success) {
      // Ensure the path points to "handler"
      expect(bad.error.issues[0]?.path).toEqual(['handler']);
      expect(bad.error.issues[0]?.code).toBe('custom');
    }
  });
});
