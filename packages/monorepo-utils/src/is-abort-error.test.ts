import Queue from 'p-queue';
import { describe, expect, it } from 'vitest';

import { isAbortError } from './is-abort-error.js';

describe('isAbortError', () => {
  it('should return true for an AbortError', () => {
    expect(isAbortError(new DOMException('Aborted', 'AbortError'))).toBe(true);
  });

  it('should return true for the error of a task removed by clearing the queue', async () => {
    const queue = new Queue({ concurrency: 1, autoStart: false });
    const task = queue.add(() => 'result');
    queue.clear();

    const rejection = await task.catch((error: unknown) => error);

    expect(isAbortError(rejection)).toBe(true);
  });

  it.each([
    ['a DOMException with another name', new DOMException('Timed out', 'TimeoutError')],
    ['an object named AbortError', { name: 'AbortError', message: 'Aborted' }],
    ['an Error', new Error('Aborted')],
    ['a string', 'AbortError'],
    ['undefined', undefined],
  ])('should return false for %s', (_, error) => {
    expect(isAbortError(error)).toBe(false);
  });
});
