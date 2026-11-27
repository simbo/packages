---
'@simbo/git-changes': minor
---

Run `git status` with `@simbo/git-exec` instead of `execa`.

- `execa` is no longer a dependency.
- If `git status` fails, the message after `Failed to get Git changes:` is the
  message of the `GitError`, with the command, the exit code, and the standard
  error output, and `cause` is that `GitError` instead of an `ExecaError`.

Code that matches the error message beyond its prefix or checks `cause` for an
`ExecaError` needs an update.
