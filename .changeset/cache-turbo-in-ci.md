---
'packages-changelog': patch
---

Reuse the Turbo cache of `main` in pull request checks.

- Runs on `main` start without a cache, check everything, and save the Turbo
  cache with `actions/cache`.
- Pull requests restore the cache of the latest run on `main` and save none, so
  checks of unchanged packages come from the cache.
