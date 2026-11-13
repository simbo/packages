/**
 * Checks whether an error is an `AbortError`, as thrown for tasks removed by clearing the queue.
 *
 * @param error - The error to check.
 * @returns Whether the error is an `AbortError`.
 */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
