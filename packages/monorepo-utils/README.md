# Monorepo Utilities

📦
[**`@simbo/monorepo-utils`**](https://npmjs.com/package/@simbo/monorepo-utils)

A set of utilities for inspecting and working with **monorepo workspaces**.

Includes functions for reading workspace metadata, resolving paths, and working
with package manifests.

## Features

- Detect and read all workspaces in a repository

- Supports workspace patterns from different monorepo setups:
  - [pnpm](https://pnpm.io/) (`pnpm-workspace.yaml`)
  - [npm](https://docs.npmjs.com/cli/v11/using-npm/workspaces) (`package.json`)

- Validate and parse workspaces' `package.json` files

- Extract metadata such as name, version, description, and README title

- Manage concurrency when scanning large monorepos

- Fully typed with TypeScript

## Installation

Install `@simbo/monorepo-utils` from the npm registry:

```bash
npm i [-D] @simbo/monorepo-utils
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_monorepo-utils/).

### Examples

#### Read All Workspaces

Concurrently find and read all workspaces in a monorepo.

Returns an array of [`WorkspaceMetadata`] objects.

```ts
import { readWorkspaces } from '@simbo/monorepo-utils';

const workspaces = await readWorkspaces();
```

#### Get Metadata for a Workspace Path

Get the [`WorkspaceMetadata`] for a workspace path.

```ts
import { getWorkspaceMetadata } from '@simbo/monorepo-utils';

const metadata = await getWorkspaceMetadata('my-workspace');
```

#### Get Workspace Paths

Get all workspace paths in a monorepo.

Returns an array of path strings.

```ts
import { getWorkspacePaths } from '@simbo/monorepo-utils';

const paths = await getWorkspacePaths();
```

#### Get Workspace Patterns

Get all workspace patterns in a monorepo.

Returns an array of pattern strings.

```ts
import { getWorkspacePatterns } from '@simbo/monorepo-utils';

const patterns = await getWorkspacePatterns();
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)

[`WorkspaceMetadata`]:
  https://simbo.codes/packages/interfaces/_simbo_monorepo-utils.WorkspaceMetadata/
