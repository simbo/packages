---
'packages-changelog': patch
---

Cache the ESLint and type checks of packages and the repository root with Turbo.

- A package's checks rerun when its files, the builds of its workspace
  dependencies, its locked dependencies, or a global input (`.npmrc`, `.nvmrc`,
  `pnpm-workspace.yaml`, the root dependencies) change.
- The type check of a package waits for its own build, because its
  `tsconfig.json` includes `dist/`.
- The root checks cover only the root files.
- `each:check` runs `check:eslint` and `check:types` of all packages without the
  root.
