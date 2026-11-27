---
'@simbo/monorepo-packages-list': patch
'@simbo/monorepo-packages-list-cli': patch
---

Find the workspaces with `@simbo/monorepo-utils` 4.

- npm workspaces are found only next to a `package-lock.json`, and pnpm
  workspaces only with a root `package.json`.
- Workspace directories listed in `.gitignore` are now listed, and directories
  that start with a dot are no longer listed.
- See "Migrating from 3.x" in the README of `@simbo/monorepo-utils`.
