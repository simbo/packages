# @simbo/git-exec

## 1.0.1

### Patch Changes

- 0bbde2e: Document when `GitError.exitCode` is `undefined`.

  - The README explains that `exitCode` is `undefined` when Git could not be
    started, was terminated by a signal, or exceeded `maxBuffer`.
  - An example shows how to tell a failed command from a Git that could not run.

## 1.0.0

### Major Changes

- dab18e8: Add `@simbo/git-exec` to run Git commands asynchronously without a
  shell.

  - `git()` returns the trimmed standard output, `gitBuffer()` the raw output
    for binary data, and `gitSucceeds()` whether the command exited with code 0.
  - The options are `cwd`, `env` (merged over `process.env`), `maxBuffer` (1 GiB
    by default), and a `debug` callback, such as `core.debug` in GitHub Actions.
  - Failures reject with a `GitError` that holds the arguments, the exit code,
    and the standard error output.
