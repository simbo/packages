---
'@simbo/find-git-repository-root': major
---

Find the root of a Git working tree with `git rev-parse --show-toplevel` instead
of searching upward for a `.git` directory.

- Inside a linked worktree or a submodule, the root of the worktree or submodule
  is returned instead of the root of an enclosing repository.
- The returned path is canonical: Git resolves symbolic links, so on macOS a
  temporary directory is returned as `/private/var/…`.
- Bare repositories, the `.git` directory, directories outside a repository,
  missing paths and files resolve to `undefined`, even if a parent directory is
  a repository.
- The function rejects with a `GitError` from `@simbo/git-exec` if Git cannot be
  started or is terminated.
- Replace the dependencies on `find-up` and `@simbo/is-git-repository-root` with
  `@simbo/git-exec` and `@simbo/accessible`.

Version 3.0.1 already returned the roots of worktrees and submodules and
rejected without Git through `@simbo/is-git-repository-root` 4.0.0; this release
makes that the contract of this package.

Git must be installed and on the `PATH`. Compare returned paths with
`realpath()` results instead of the given path, handle `undefined` for missing
directories, and catch the `GitError` where Git may be missing.
