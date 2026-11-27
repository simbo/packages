# @simbo/monorepo-packages-list-cli

## 3.0.1

### Patch Changes

- Updated dependencies [3d93303]
  - @simbo/monorepo-utils@3.0.1
  - @simbo/monorepo-packages-list@3.0.1

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

- Updated dependencies [19c8dc1]
- Updated dependencies [19c8dc1]
- Updated dependencies [19c8dc1]
  - @simbo/accessible@3.0.0
  - @simbo/call-prettier@3.0.0
  - @simbo/cli-output@3.0.0
  - @simbo/clirk@3.0.0
  - @simbo/find-git-repository-root@3.0.0
  - @simbo/inject-between-html-comments@3.0.0
  - @simbo/monorepo-packages-list@3.0.0
  - @simbo/monorepo-utils@3.0.0
  - @simbo/user-facing-error@3.0.0
  - @simbo/zodpak@2.0.0

## 2.0.3

### Patch Changes

- Updated dependencies [2bf4f7d]
  - @simbo/monorepo-utils@2.0.3
  - @simbo/monorepo-packages-list@2.0.3

## 2.0.2

### Patch Changes

- 6f304e0: Include the original sources in source maps (`inlineSources`), so
  debuggers and stack traces show the TypeScript code without publishing `src`.
- Updated dependencies [6f304e0]
- Updated dependencies [760573e]
- Updated dependencies [3982c1d]
  - @simbo/accessible@2.0.1
  - @simbo/call-prettier@2.0.2
  - @simbo/cli-output@2.0.1
  - @simbo/clirk@2.0.2
  - @simbo/find-git-repository-root@2.0.1
  - @simbo/inject-between-html-comments@2.0.1
  - @simbo/monorepo-packages-list@2.0.2
  - @simbo/monorepo-utils@2.0.2
  - @simbo/user-facing-error@2.0.1
  - @simbo/zodpak@1.0.1

## 2.0.1

### Patch Changes

- e235985: Update `zod` to ^4.6.7.
- Updated dependencies [e235985]
- Updated dependencies [e235985]
- Updated dependencies [e235985]
  - @simbo/call-prettier@2.0.1
  - @simbo/monorepo-utils@2.0.1
  - @simbo/clirk@2.0.1
  - @simbo/monorepo-packages-list@2.0.1
  - @simbo/accessible@2.0.0
  - @simbo/cli-output@2.0.0
  - @simbo/find-git-repository-root@2.0.0
  - @simbo/inject-between-html-comments@2.0.0
  - @simbo/user-facing-error@2.0.0
  - @simbo/zodpak@1.0.0

## 2.0.0

### Major Changes

- 2ded9ff: Upgrade configuration discovery in the packages list CLI to
  Cosmiconfig ^10.0.1 and `cosmiconfig-typescript-loader` ^6.3.0. Cosmiconfig 10
  requires Node.js ^22.18 || >=24.

  Together with the updated package normalization dependency used through Clirk,
  the CLI now requires Node.js ^22.22.2 || ^24.15.0 || >=26.0.0. Node.js 20 is
  no longer supported; upgrade the runtime before updating the CLI.

- 2ded9ff: Require Node.js ^22.22.2 || ^24.15.0 || >=26.0.0 across all packages
  to align with the runtime requirements of the updated dependencies. Node.js
  20, 21, 23 and 25, as well as earlier Node.js 22 and 24 releases, are no
  longer supported. Upgrade to a supported Node.js version before updating these
  packages.

### Patch Changes

- 2ded9ff: Document the shared Node.js requirements and updated peer
  dependencies. Correct API documentation links, installation and usage
  examples, and repository development instructions. Clarify string count
  conversion, literal replacements and import metadata fallbacks.
- 2ded9ff: Update runtime dependencies: Yoctocolors to ^2.2.0, Zod to ^4.6.5,
  Globby to ^16.2.4, PQueue to ^9.3.3, YAML to ^2.9.1 and `type-fest` to ^5.10.0
  in the packages that use them.
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
- Updated dependencies [2ded9ff]
  - @simbo/accessible@2.0.0
  - @simbo/call-prettier@2.0.0
  - @simbo/cli-output@2.0.0
  - @simbo/clirk@2.0.0
  - @simbo/find-git-repository-root@2.0.0
  - @simbo/inject-between-html-comments@2.0.0
  - @simbo/monorepo-packages-list@2.0.0
  - @simbo/monorepo-utils@2.0.0
  - @simbo/user-facing-error@2.0.0
  - @simbo/zodpak@1.0.0

## 1.0.5

### Patch Changes

- 39c0ab9: fix pnpm workspace dependencies
- Updated dependencies [39c0ab9]
  - @simbo/clirk@1.1.4
  - @simbo/inject-between-html-comments@1.0.4
  - @simbo/monorepo-packages-list@1.1.5
  - @simbo/monorepo-utils@1.0.6
  - @simbo/zodpak@0.1.4
  - @simbo/accessible@1.0.1
  - @simbo/call-prettier@1.0.2
  - @simbo/cli-output@1.0.1
  - @simbo/find-git-repository-root@1.0.2
  - @simbo/user-facing-error@1.0.2

## 1.0.4

### Patch Changes

- Updated dependencies [faa5cdc]
- Updated dependencies [faa5cdc]
  - @simbo/clirk@1.1.3
  - @simbo/inject-between-html-comments@1.0.3
  - @simbo/monorepo-packages-list@1.1.4
  - @simbo/monorepo-utils@1.0.5
  - @simbo/zodpak@0.1.3
  - @simbo/accessible@1.0.1
  - @simbo/call-prettier@1.0.2
  - @simbo/cli-output@1.0.1
  - @simbo/find-git-repository-root@1.0.2
  - @simbo/user-facing-error@1.0.2

## 1.0.3

### Patch Changes

- Updated dependencies [033b8b5]
  - @simbo/monorepo-utils@1.0.4
  - @simbo/monorepo-packages-list@1.1.3

## 1.0.2

### Patch Changes

- 6457f71: fix arguments schema
- 6457f71: upgrade dependencies
- Updated dependencies [6457f71]
  - @simbo/clirk@1.1.2
  - @simbo/find-git-repository-root@1.0.2
  - @simbo/monorepo-packages-list@1.1.2
  - @simbo/monorepo-utils@1.0.3
  - @simbo/zodpak@0.1.2
  - @simbo/accessible@1.0.1
  - @simbo/call-prettier@1.0.2
  - @simbo/cli-output@1.0.1
  - @simbo/inject-between-html-comments@1.0.2
  - @simbo/user-facing-error@1.0.2

## 1.0.1

### Patch Changes

- c999daf: upgrade dependencies
- Updated dependencies [c999daf]
  - @simbo/clirk@1.1.1
  - @simbo/monorepo-packages-list@1.1.1
  - @simbo/zodpak@0.1.1
  - @simbo/accessible@1.0.1
  - @simbo/call-prettier@1.0.1
  - @simbo/cli-output@1.0.1
  - @simbo/find-git-repository-root@1.0.1
  - @simbo/inject-between-html-comments@1.0.2
  - @simbo/monorepo-utils@1.0.2
  - @simbo/user-facing-error@1.0.2

## 1.0.0

### Major Changes

- 2344e40: Initial Release

### Patch Changes

- Updated dependencies [d10c598]
- Updated dependencies [65e941c]
- Updated dependencies [eff2035]
- Updated dependencies [44fea53]
- Updated dependencies [d3e26a3]
- Updated dependencies [7cd61a5]
- Updated dependencies [db186da]
- Updated dependencies [aeaa010]
- Updated dependencies [44fea53]
  - @simbo/zodpak@0.1.0
  - @simbo/clirk@1.1.0
  - @simbo/call-prettier@1.0.1
  - @simbo/monorepo-packages-list@1.1.0
  - @simbo/monorepo-utils@1.0.2
  - @simbo/accessible@1.0.1
  - @simbo/find-git-repository-root@1.0.1
  - @simbo/inject-between-html-comments@1.0.2
  - @simbo/user-facing-error@1.0.2
  - @simbo/cli-output@1.0.1
