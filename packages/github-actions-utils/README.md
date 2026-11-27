# GitHub Actions Utils

📦
[**`@simbo/github-actions-utils`**](https://npmjs.com/package/@simbo/github-actions-utils)

Run a GitHub Action and parse its inputs strictly: booleans, options, and
repositories.

Built on `@actions/core`, for JavaScript and TypeScript actions.

## Features

- `runAction()` runs the main function of an action and fails the action with
  the message of the error and all its causes

- `parseBoolean()` accepts only the boolean values of the YAML 1.2 core schema,
  like `core.getBooleanInput`, and falls back to a default for an empty input

- `parseOption()` accepts only one of the given options, case-sensitive, with a
  typed result

- `parseRepository()` splits an `owner/repo` input and falls back to the
  repository the workflow runs in

- Errors name the input, the value, and what is expected

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/github-actions-utils` from the npm registry:

```bash
npm i @simbo/github-actions-utils
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_github-actions-utils/).

```ts
import { getInput, info } from '@actions/core';
import {
  parseBoolean,
  parseOption,
  parseRepository,
  runAction,
} from '@simbo/github-actions-utils';

await runAction(async () => {
  const token = getInput('token', { required: true });
  const { owner, repo } = parseRepository();
  const dryRun = parseBoolean('dry-run', false);
  const ifNoChanges = parseOption(
    'if-no-changes',
    ['error', 'warn', 'ignore'],
    'error',
  );

  info(`Running for ${owner}/${repo} (dry run: ${dryRun}).`);
  // …
});
```

### Running an Action

`runAction(main)` awaits `main`. If it throws or rejects, `runAction()` calls
`core.setFailed`, which logs an error annotation and sets `process.exitCode` to

1. The message is the message of the error, followed by one `Caused by:` line
   for each error in its `cause` chain. The stack trace is logged with
   `core.debug`, which is only visible in debug logs.

`runAction()` never rejects and does not end the process, so pending output and
handles complete as usual.

### Parsing Inputs

All parsers read the input with `core.getInput`, which ignores surrounding
whitespace. An empty input counts as not set.

| Function                                   | Empty input         | Accepted values                                      |
| ------------------------------------------ | ------------------- | ---------------------------------------------------- |
| `parseBoolean(name, defaultValue)`         | `defaultValue`      | `true`, `True`, `TRUE`, `false`, `False`, `FALSE`    |
| `parseOption(name, options, defaultValue)` | `defaultValue`      | exactly one of `options`                             |
| `parseRepository(name = 'repository')`     | `GITHUB_REPOSITORY` | `owner/repo` with letters, digits, `_`, `.`, and `-` |

Invalid values throw an error that names the input:

```text
Invalid input "dry-run": "yes" (expected one of: true, True, TRUE, false, False, FALSE).
Invalid input "if-no-changes": "Error" (expected one of: error, warn, ignore).
Invalid input "repository": "my-repo" (expected "owner/repo").
Input required: "repository" (GITHUB_REPOSITORY is not set either).
```

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2026/)
