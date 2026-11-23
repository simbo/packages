---
'changelog': patch
---

Set up pnpm and Node.js with `pnpm/setup` in all workflows.

- Replace `pnpm/action-setup` and `actions/setup-node` with one `pnpm/setup`
  v3.2.0 step that reads pnpm from `packageManager` and Node.js from `.nvmrc`.
- Keep the explicit install steps and the store cache where the workflows cached
  before; the publish workflow still runs without a cache.
