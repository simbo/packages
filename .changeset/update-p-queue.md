---
'@simbo/monorepo-utils': patch
---

Update `p-queue` to ^10.0.0 and adapt to its queue behavior.

- `getPackagePathByName()` no longer fails with `failOnError` after finding the
  package.
- `readWorkspaces()` reports only the workspaces that failed.
- Both functions reject a `concurrency` that is not a positive integer or
  `Infinity` with a `TypeError`.
