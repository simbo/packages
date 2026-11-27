# @simbo/github-actions-octokit

## 1.0.1

### Patch Changes

- 5bf43d7: Publish from CI with npm trusted publishing.

  - This release is the first one published by the release workflow, with
    provenance, instead of by hand; the package itself is unchanged.

## 1.0.0

### Major Changes

- 3222348: Add `@simbo/github-actions-octokit` to create an Octokit client for
  GitHub Actions that waits and retries on rate limits.

  - `createOctokit()` authenticates with a token through `getOctokit` from
    `@actions/github` and passes further options on.
  - Requests that hit the primary or secondary rate limit are retried up to
    `RATE_LIMIT_MAX_RETRIES` (4) times with `@octokit/plugin-throttling`, and
    `shouldRetryOnRateLimit()` logs each decision as a warning.
  - `hasStatus()` checks whether an error has a given HTTP status.
