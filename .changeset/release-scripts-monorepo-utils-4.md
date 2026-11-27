---
'packages-changelog': patch
---

Adapt the release scripts to `@simbo/monorepo-utils` 4.

- `scripts/release-package.js` no longer passes the removed `failOnError`
  option.
- The test fixtures of the release scripts have a root `package.json`, which
  pnpm monorepos need to be detected.
