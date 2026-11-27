import { warning } from '@actions/core';
import { getOctokit } from '@actions/github';
import { throttling } from '@octokit/plugin-throttling';

/**
 * An authenticated Octokit client with rate limit handling.
 */
export type Octokit = ReturnType<typeof getOctokit>;

/**
 * The options of `getOctokit` from `@actions/github`, such as `baseUrl`,
 * `userAgent`, or `request`.
 */
export type CreateOctokitOptions = NonNullable<Parameters<typeof getOctokit>[1]>;

/**
 * The kind of rate limit that GitHub reports.
 */
export type RateLimitKind = 'primary' | 'secondary';

/**
 * The parts of a request description used in log messages.
 */
export interface RateLimitedRequest {
  /**
   * The HTTP method, such as `GET`.
   */
  method: string;

  /**
   * The URL template of the request, such as `/repos/{owner}/{repo}`.
   */
  url: string;
}

/**
 * Maximum number of retries of a request that hits a rate limit.
 */
export const RATE_LIMIT_MAX_RETRIES = 4;

/**
 * Decides whether to retry a request that hit a rate limit, and logs a warning
 * with `warning` from `@actions/core`.
 *
 * @param kind - The kind of rate limit, for the log message.
 * @param retryAfter - The seconds GitHub asks to wait.
 * @param request - The request that hit the rate limit.
 * @param retryCount - The number of retries so far.
 * @returns `true` to retry after the wait time, `false` after
 * {@link RATE_LIMIT_MAX_RETRIES} retries.
 */
export function shouldRetryOnRateLimit(
  kind: RateLimitKind,
  retryAfter: number,
  request: RateLimitedRequest,
  retryCount: number,
): boolean {
  const description = `${request.method} ${request.url}`;
  if (retryCount >= RATE_LIMIT_MAX_RETRIES) {
    warning(`The ${kind} rate limit persists for ${description}; giving up after ${retryCount} retries.`);
    return false;
  }
  warning(
    `The ${kind} rate limit was reached for ${description}; retrying in ${retryAfter} seconds ` +
      `(retry ${retryCount + 1} of ${RATE_LIMIT_MAX_RETRIES}).`,
  );
  return true;
}

/**
 * Creates an authenticated Octokit client with `getOctokit` from
 * `@actions/github` that waits and retries when GitHub reports a rate limit,
 * using the official plugin `@octokit/plugin-throttling`.
 *
 * Both rate limit handlers call {@link shouldRetryOnRateLimit} and replace any
 * handlers in `options.throttle`; its other settings are kept.
 *
 * @param token - The token to authenticate with, such as `GITHUB_TOKEN`.
 * @param options - Further options for `getOctokit`.
 * @returns The Octokit client.
 */
export function createOctokit(token: string, options: CreateOctokitOptions = {}): Octokit {
  return getOctokit(
    token,
    {
      ...options,
      throttle: {
        ...options.throttle,
        onRateLimit: (retryAfter: number, request: RateLimitedRequest, _octokit: unknown, retryCount: number) =>
          shouldRetryOnRateLimit('primary', retryAfter, request, retryCount),
        onSecondaryRateLimit: (
          retryAfter: number,
          request: RateLimitedRequest,
          _octokit: unknown,
          retryCount: number,
        ) => shouldRetryOnRateLimit('secondary', retryAfter, request, retryCount),
      },
    },
    throttling,
  );
}
