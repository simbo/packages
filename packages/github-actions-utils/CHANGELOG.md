# @simbo/github-actions-utils

## 1.0.0

### Major Changes

- 23ddaf5: Add `@simbo/github-actions-utils` to run a GitHub Action and parse
  its inputs strictly.

  - `runAction()` runs the main function of an action and fails it through
    `core.setFailed` with the message of the error and its causes; the stack
    trace goes to the debug log.
  - `parseBoolean()` accepts only the boolean values of the YAML 1.2 core schema
    and returns a default for an empty input.
  - `parseOption()` accepts only one of the given options, case-sensitive.
  - `parseRepository()` splits an `owner/repo` input into `{ owner, repo }` and
    falls back to `GITHUB_REPOSITORY`.
  - Errors name the input, the value, and what is expected.
