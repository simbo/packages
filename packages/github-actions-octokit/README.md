# GitHub Actions Octokit

📦
[**`@simbo/github-actions-octokit`**](https://npmjs.com/package/@simbo/github-actions-octokit)

Create an authenticated Octokit client for GitHub Actions that waits and retries
on rate limits.

Built on `getOctokit` from `@actions/github` and the official plugin
`@octokit/plugin-throttling`.

## Features

- `createOctokit()` returns the client of `getOctokit`, with the REST endpoint
  methods, pagination, and GraphQL

- Requests that hit the primary or secondary rate limit wait as long as GitHub
  asks and are retried up to `RATE_LIMIT_MAX_RETRIES` (4) times

- Every retry and the final failure are logged as warnings in the workflow run

- `hasStatus()` checks whether a failed request has a given HTTP status, such as
  404 or 422

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0`. Meant for JavaScript actions, since it
logs with `@actions/core`.

## Installation

Install `@simbo/github-actions-octokit` from the npm registry:

```bash
npm i @simbo/github-actions-octokit
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_github-actions-octokit/).

```ts
import { getInput } from '@actions/core';
import { createOctokit, hasStatus } from '@simbo/github-actions-octokit';

const octokit = createOctokit(getInput('token', { required: true }));

try {
  await octokit.rest.git.getRef({
    owner: 'simbo',
    repo: 'packages',
    ref: 'tags/v1.0.0',
  });
} catch (error) {
  if (!hasStatus(error, 404)) {
    throw error;
  }
  // the tag does not exist
}
```

### Rate Limits

When GitHub reports a rate limit, the client waits for the time that GitHub
names and retries the request. After `RATE_LIMIT_MAX_RETRIES` retries, it gives
up and the request rejects with the error of GitHub. Each decision is logged
with `warning` from `@actions/core`:

```text
The secondary rate limit was reached for POST /repos/{owner}/{repo}/git/refs; retrying in 60 seconds (retry 1 of 4).
The primary rate limit persists for GET /repos/{owner}/{repo}; giving up after 4 retries.
```

`shouldRetryOnRateLimit()` makes this decision and can serve as a handler for
your own Octokit client with `@octokit/plugin-throttling`.

### Options

The second argument of `createOctokit()` takes the options of `getOctokit` from
`@actions/github`, such as `baseUrl`, `userAgent`, `previews`, or `log`.

| Option     | Description                                                                                                   | Default                    |
| ---------- | ------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `baseUrl`  | The URL of the GitHub API.                                                                                    | `GITHUB_API_URL` or GitHub |
| `request`  | Request options; replaces the defaults of `@actions/github` as a whole, including its proxy support.          | proxy-aware `fetch`        |
| `throttle` | Settings of `@octokit/plugin-throttling`; the handlers `onRateLimit` and `onSecondaryRateLimit` are replaced. | the defaults of the plugin |

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2026/)
