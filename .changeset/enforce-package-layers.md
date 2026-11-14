---
'changelog': minor
---

Enforce package layers with Turbo boundaries.

- Tag every package as `config`, `core`, `lib`, `cli` or `meta` in its
  `turbo.json`.
- Allow `config` packages to depend only on other `config` packages, and `core`
  packages on no internal runtime packages.
- Prevent any package from depending on `cli` or `meta` packages.
