---
'@simbo/git-changes': patch
---

Find the repository root with Git through `@simbo/find-git-repository-root` 4.

- Inside a linked worktree or a submodule, `getGitChanges()` reports the changes
  of the worktree or submodule instead of an enclosing repository. Version 4.1.1
  already does this through `@simbo/find-git-repository-root` 3.0.1, without a
  note in this changelog.
- A working directory that does not exist rejects as not part of a Git
  repository instead of reporting the changes of an enclosing repository.
