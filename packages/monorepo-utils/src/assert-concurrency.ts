/**
 * Asserts that a concurrency value is a positive integer or `Infinity`, as required by the queue.
 *
 * @param concurrency - The concurrency value to check.
 * @throws {TypeError} If the concurrency is not a positive integer or `Infinity`.
 */
export function assertConcurrency(concurrency: unknown): asserts concurrency is number {
  if (
    typeof concurrency !== 'number' ||
    concurrency <= 0 ||
    (concurrency !== Infinity && !Number.isSafeInteger(concurrency))
  ) {
    throw new TypeError('Concurrency must be a positive integer');
  }
}
