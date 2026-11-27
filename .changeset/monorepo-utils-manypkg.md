---
'@simbo/monorepo-utils': major
---

Find the monorepo and its workspaces with `@manypkg/get-packages`.

- Workspaces of npm, pnpm, Yarn, Bun, Lerna, and Rush monorepos are detected.
- `workingDir` can be any directory inside the monorepo; the root is searched
  upward from it, and paths are relative to the root.
- `getWorkspacePatterns()` is removed, and `getWorkspacePaths()` no longer
  accepts `patterns`.
- `getPackagePathByName()` no longer accepts `concurrency` and `failOnError`,
  and rejects if a workspace manifest cannot be read.
- Replace `globby`, `yaml`, and `@simbo/accessible` with `@manypkg/get-packages`
  ^3.1.0.

Migration: npm, Yarn, and Bun workspaces are found only next to their lockfile,
and pnpm workspaces only with a root `package.json`. Workspace directories
listed in `.gitignore` are now included, and directories that start with a dot
are no longer included. Remove the dropped options and replace
`getWorkspacePatterns()` with `getWorkspacePaths()`. See "Migrating from 3.x" in
the README.
