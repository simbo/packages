# @simbo/rollup-github-actions-config

## 3.0.1

### Patch Changes

- ba08199: Disable source maps and declarations in the TypeScript plugin to
  match the bundle output.

  - `getConfig()` passes `sourceMap: false`, `inlineSources: false` and
    `declaration: false` to `@rollup/plugin-typescript`, like
    `output.sourcemap: false`.
  - A `tsconfig.build.json` that extends `@simbo/tsconfig` no longer needs to
    disable these options itself. Without them, the plugin warned that Rollup's
    `sourcemap` option was not set and emitted declaration files into `dist`.
  - Options that a `tsconfig.build.json` already sets this way keep working; the
    bundle stays the same.

## 3.0.0

### Major Changes

- 19c8dc1: Require Node.js ^24.15.0 || >=26.0.0 across all packages, as Node.js
  22 reaches its end of life on 2027-04-30.

  - Remove `^22.22.2` from `engines.node` in every package.
  - Update the requirements in the package READMEs.

  Node.js 22 is no longer supported. Upgrade to Node.js ^24.15.0 or >=26.0.0
  before updating these packages.

### Patch Changes

- 19c8dc1: Point the `repository` field of the manifest to the workspace folder.

  - `repository` uses the object form with `type`, `url`, and `directory`, so
    npm links the package folder and resolves relative links in the README from
    there.
  - `packages-changelog` gets the field for the first time.

## 2.0.1

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- 3982c1d: Update dependencies.

  - `@rollup/plugin-terser` to ^1.0.2
  - `@rollup/plugin-typescript` to ^12.3.1
  - `tslib` to ^2.9.1

## 2.0.0

### Major Changes

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.

### Patch Changes

- 2ded9ff: Update documentation links from `simbo.codes` to `simbo.de`,
  including the package READMEs and generated package list.
- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.
- 2ded9ff: Upgrade the Rollup configuration to `@rollup/plugin-terser` ^1.0.0
  and `@rollup/plugin-commonjs` ^29.0.3.

## 1.0.2

### Patch Changes

- a7ed93e: ignore warning about circular dependencies in `@actions/core`

## 1.0.1

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies

## 1.0.0

### Major Changes

- 0ab1038: Initial release
