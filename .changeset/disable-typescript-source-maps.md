---
'@simbo/rollup-github-actions-config': patch
---

Disable source maps and declarations in the TypeScript plugin to match the
bundle output.

- `getConfig()` passes `sourceMap: false`, `inlineSources: false` and
  `declaration: false` to `@rollup/plugin-typescript`, like
  `output.sourcemap: false`.
- A `tsconfig.build.json` that extends `@simbo/tsconfig` no longer needs to
  disable these options itself. Without them, the plugin warned that Rollup's
  `sourcemap` option was not set and emitted declaration files into `dist`.
- Options that a `tsconfig.build.json` already sets this way keep working; the
  bundle stays the same.
