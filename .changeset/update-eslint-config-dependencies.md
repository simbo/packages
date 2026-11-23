---
'@simbo/eslint-config': patch
---

Update dependencies.

- `eslint-plugin-jsdoc` to ^65.5.0
- `typescript-eslint` to ~8.72.2, which holds it below 8.73.0: that release adds
  `no-unsafe-class-instance-assignment` to `strictTypeChecked` and reports new
  `no-unsafe-member-access` errors on code that type checks.
