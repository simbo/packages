---
'@simbo/monorepo-utils': patch
---

Read `pnpm-workspace.yaml` when a bundler exposes `yaml` only as a default
export.

- `getWorkspacePatterns()` falls back to the default export of `yaml` when the
  dynamic import provides no named `parse` export, as some bundler setups do for
  CommonJS packages.
- `yaml` is still loaded only when a `pnpm-workspace.yaml` is read.
