/**
 * Checks whether an error is an HTTP error with the given status, such as a
 * `RequestError` that Octokit throws for a failed request.
 *
 * @param error - The error to check.
 * @param status - The expected HTTP status.
 * @returns `true` if the error has a `status` property with the given value.
 */
export function hasStatus(error: unknown, status: number): error is { status: number } {
  return typeof error === 'object' && error !== null && 'status' in error && error.status === status;
}
