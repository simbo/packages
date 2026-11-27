---
'@simbo/is-git-repository-root': major
---

Detect the root of a Git working tree with `git rev-parse --show-toplevel`
instead of looking for a `.git` directory.

- The roots of linked worktrees and submodules, where `.git` is a file, are
  detected as roots.
- The given directory and the top-level directory are compared after resolving
  symbolic links.
- Bare repositories, the `.git` directory, subdirectories, missing paths and
  files still return `false`.
- A directory outside a Git repository returns `false`, even if it contains a
  `.git` directory.
- The function rejects with a `GitError` from `@simbo/git-exec` if Git cannot be
  started or is terminated.
- Replace the dependency on `@simbo/git-constants` with `@simbo/git-exec`.

Git must be installed and on the `PATH`. Code that relied on `false` for
worktree and submodule roots, on `true` for a `.git` directory outside a
repository, or on the function never rejecting must be adapted; catch the
`GitError` where Git may be missing.
