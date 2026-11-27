# Monorepo Utilities

📦
[**`@simbo/monorepo-utils`**](https://npmjs.com/package/@simbo/monorepo-utils)

A set of utilities for inspecting and working with **monorepo workspaces**.

Includes functions for finding the monorepo root, reading workspace metadata,
and resolving workspace paths.

## Features

- Find the root of a monorepo from any directory inside it, also in Git
  worktrees

- Detect workspaces with
  [`@manypkg/get-packages`](https://github.com/Thinkmill/manypkg), which
  supports npm, pnpm, Yarn, Bun, Lerna, and Rush

- Validate and parse workspaces' `package.json` files

- Extract metadata such as name, version, description, and the README title as
  plain text

- Read workspaces concurrently with a configurable limit, and report every
  workspace that fails

- Fully typed with TypeScript

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/monorepo-utils` from the npm registry:

```bash
npm i [-D] @simbo/monorepo-utils
```

## Related Packages

- [`@simbo/monorepo-packages-list`](https://npmjs.com/package/@simbo/monorepo-packages-list)
- [`@simbo/monorepo-packages-list-cli`](https://npmjs.com/package/@simbo/monorepo-packages-list-cli)

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_monorepo-utils/).

### Examples

#### Find the Monorepo Root

Find the root of the monorepo that contains the current working directory.

Returns the absolute path, or `undefined` if no monorepo contains the directory.

```ts
import { findMonorepoRoot } from '@simbo/monorepo-utils';

const root = await findMonorepoRoot();
```

#### Read All Workspaces

Concurrently read all workspaces of the monorepo, sorted by path.

Returns an array of [`WorkspaceMetadata`] objects. If workspaces cannot be read,
it rejects with an error that names every one of them.

```ts
import { readWorkspaces } from '@simbo/monorepo-utils';

const workspaces = await readWorkspaces({ concurrency: 4 });
```

#### Get Metadata for a Workspace Path

Get the [`WorkspaceMetadata`] for a workspace path.

```ts
import { getWorkspaceMetadata } from '@simbo/monorepo-utils';

const metadata = await getWorkspaceMetadata('my-workspace');
```

#### Get Workspace Paths

Get the paths of all workspaces, relative to the monorepo root or absolute.

```ts
import { getWorkspacePaths } from '@simbo/monorepo-utils';

const paths = await getWorkspacePaths({ absolutePaths: true });
```

#### Get Package Path by Name

Get the path of a workspace by its package name.

```ts
import { getPackagePathByName } from '@simbo/monorepo-utils';

const packagePath = await getPackagePathByName('my-package');
```

### Workspace Detection

`workingDir` can be any directory inside the monorepo. The root is searched from
there upward. A directory is a monorepo root if it has one of these:

| Package manager | Configuration                                                  |
| --------------- | -------------------------------------------------------------- |
| pnpm            | `pnpm-workspace.yaml` and `package.json`                       |
| npm             | `workspaces` in `package.json` and a `package-lock.json`       |
| Yarn            | `workspaces` in `package.json` and a `yarn.lock`               |
| Bun             | `workspaces` in `package.json` and a `bun.lock` or `bun.lockb` |
| Lerna           | `lerna.json` and `package.json`                                |
| Rush            | `rush.json`                                                    |

npm, Yarn, and Bun workspaces are not found without their lockfile. Workspace
patterns are matched without `.gitignore` and skip directories that start with a
dot.

## Migrating from 3.x

- `getWorkspacePatterns()` is removed. The patterns are read internally.
- `getWorkspacePaths()` no longer accepts `patterns`.
- `getPackagePathByName()` no longer accepts `concurrency` and `failOnError`. It
  rejects if any workspace manifest cannot be read.
- A monorepo is detected as described in
  [Workspace Detection](#workspace-detection). Before, `workspaces` in
  `package.json` or `pnpm-workspace.yaml` was enough. Add the lockfile, and for
  pnpm a root `package.json`, if your monorepo is no longer found.
- Workspaces in directories listed in `.gitignore` are now included, and
  workspaces in directories that start with a dot are no longer included.
- `workingDir` no longer has to be the root: the root is searched upward from
  it. Paths are relative to the root.

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)

[`WorkspaceMetadata`]:
  https://simbo.de/packages/interfaces/_simbo_monorepo-utils.WorkspaceMetadata/
