---
'@simbo/monorepo-utils': patch
---

Update `p-queue` to ^10.0.0. Ignore the `AbortError` of tasks skipped after the
queue is cleared, so `getPackagePathByName()` no longer fails with `failOnError`
after finding the package, and `readWorkspaces()` reports only the workspaces
that failed. Both functions now reject a `concurrency` that is not a positive
integer or `Infinity` with a `TypeError`.
