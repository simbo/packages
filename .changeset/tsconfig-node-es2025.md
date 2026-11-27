---
'@simbo/tsconfig': major
---

Target ES2024 and include the ES2025 library in the Node.js configuration.

- `@simbo/tsconfig/node` sets `target` to `ES2024` and `lib` to `["ES2025"]`,
  which all supported Node.js versions run, for example `RegExp.escape()`,
  `Promise.try()` and iterator helpers.
- The `typescript` peer dependency requires ^6, because TypeScript ships the
  ES2025 library from 6.0 on.
- `@simbo/tsconfig/browser` does not change.

Update to TypeScript 6 before updating this package. Projects that extend
`@simbo/tsconfig/node` get the ES2024 and ES2025 types and syntax, so run their
type checks after the update.
