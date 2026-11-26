---
'packages-changelog': patch
---

Dispatch the Release and Docs workflows with `gh workflow run` instead of
repository dispatch events.

- The dispatching jobs need only `actions: write`, not `contents: write` or the
  app token; `peter-evans/repository-dispatch` is no longer used.
- The Release and Docs workflows run only when dispatched by the previous
  workflow on `main`; manual runs are skipped, and "Re-run" keeps the original
  actor.
- The Release workflow fails if `main` has moved on from the checked commit; the
  Docs workflow builds the release commit instead of the current `main`.
