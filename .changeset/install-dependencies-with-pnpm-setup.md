---
'changelog': patch
---

Install dependencies with `pnpm/setup` instead of a separate workflow step.

- Run the install in the setup step of the checks, docs, release, and GitHub
  release workflows, which caches the lockfile verification right after the
  install.
- Require an existing lockfile with `require-lockfile: true`, which replaces
  `pnpm install --frozen-lockfile`.
