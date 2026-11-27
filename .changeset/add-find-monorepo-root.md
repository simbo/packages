---
'@simbo/monorepo-utils': minor
---

Add `findMonorepoRoot()` to find the root of the monorepo that contains a
directory.

- It searches the directory and its parents for a workspace configuration and
  works in Git worktrees and for monorepos inside other repositories.
- It returns `undefined` if no monorepo contains the directory.
