---
'@simbo/monorepo-utils': patch
---

Read workspaces concurrently with `p-map` ^7.1.1 instead of `p-queue`.

- `readWorkspaces()` reads every workspace and reports all that fail, in the
  order of the workspaces, instead of stopping at the first failure.
- An invalid `concurrency` is rejected by `p-map` with a `TypeError`.
