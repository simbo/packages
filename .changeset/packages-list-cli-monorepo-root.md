---
'@simbo/monorepo-packages-list-cli': patch
---

Find the monorepo root instead of the root of the Git repository.

- The root is found with `findMonorepoRoot()` from `@simbo/monorepo-utils`, so
  the CLI also works in Git worktrees and without a Git repository.
- Remove the dependency on `@simbo/find-git-repository-root`.
