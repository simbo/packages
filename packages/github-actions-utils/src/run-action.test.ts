import { EOL } from 'node:os';
import process from 'node:process';

import { describe, expect, it, vi } from 'vitest';

import { runAction } from './run-action.js';

/**
 * Runs an action and captures the workflow commands it writes to standard output.
 *
 * @param main - The main function of the action.
 * @returns The lines written to standard output and the exit code afterwards.
 */
async function capture(
  main: () => Promise<void> | void,
): Promise<{ lines: string[]; exitCode: typeof process.exitCode }> {
  const chunks: string[] = [];
  const write = vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
    chunks.push(String(chunk));
    return true;
  });
  try {
    await runAction(main);
    return { lines: chunks.join('').split(EOL).filter(Boolean), exitCode: process.exitCode };
  } finally {
    write.mockRestore();
    process.exitCode = undefined;
  }
}

describe('runAction', () => {
  it('runs the main function and leaves the exit code unset', async () => {
    const main = vi.fn(async () => {
      await Promise.resolve();
    });
    const { lines, exitCode } = await capture(main);
    expect(main).toHaveBeenCalledOnce();
    expect(lines).toEqual([]);
    expect(exitCode).toBeUndefined();
  });

  it('reports a rejection as error and sets the exit code to 1', async () => {
    const { lines, exitCode } = await capture(async () => {
      await Promise.reject(new Error('Something failed.'));
    });
    expect(lines.filter(line => line.startsWith('::error::'))).toEqual(['::error::Something failed.']);
    expect(exitCode).toBe(1);
  });

  it('reports a synchronous throw', async () => {
    const { lines, exitCode } = await capture(() => {
      throw new Error('Thrown.');
    });
    expect(lines).toContain('::error::Thrown.');
    expect(exitCode).toBe(1);
  });

  it('reports values that are not errors', async () => {
    const { lines } = await capture(async () => {
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- tests a non-error rejection
      await Promise.reject('a string');
    });
    expect(lines).toEqual(['::error::a string']);
  });

  it('appends the messages of all causes', async () => {
    const { lines } = await capture(() => {
      throw new Error('Cannot read the file.', { cause: new Error('ENOENT', { cause: 'disk gone' }) });
    });
    expect(lines).toContain('::error::Cannot read the file.%0ACaused by: ENOENT%0ACaused by: disk gone');
  });

  it('stops at a circular cause', async () => {
    const outer = new Error('Outer.');
    Object.defineProperty(outer, 'cause', { value: new Error('Inner.', { cause: outer }) });
    const { lines } = await capture(() => {
      throw outer;
    });
    expect(lines).toContain('::error::Outer.%0ACaused by: Inner.');
  });

  it('logs the stack trace as debug message', async () => {
    const error = new Error('With stack.');
    const { lines } = await capture(() => {
      throw error;
    });
    const debug = lines.find(line => line.startsWith('::debug::'));
    expect(debug).toMatch(/^::debug::Error: With stack\.%0A\s+at /);
  });
});
