# @simbo/git-exec

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
