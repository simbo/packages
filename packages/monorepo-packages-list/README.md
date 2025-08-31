# Monorepo Packages List

[📦 **`@simbo/monorepo-packages-list`**](https://npmjs.com/package/@simbo/monorepo-packages-list)

A utility library that generates a **list of monorepo packages with metadata**.

It works with [npm](https://docs.npmjs.com/cli/v11/using-npm/workspaces) and
[pnpm](https://pnpm.io/) workspaces and is built on top of
[`@simbo/monorepo-utils`](https://npmjs.com/package/@simbo/monorepo-utils).

## Features

- Collects workspace metadata from npm or pnpm monorepos

- Fully customizable output via templates and hooks

- Supports filtering, sorting, and URL generation for each package

- Handles inserting content before and after the list for complete page sections

- Async, Promise-based API

- Fully typed with TypeScript

## Installation

Install `@simbo/monorepo-packages-list` from the npm registry:

```bash
npm i [-D] @simbo/monorepo-packages-list
```

## Usage

[`monorepoPackagesList()`](https://simbo.codes/packages/functions/_simbo_monorepo-packages-list.monorepoPackagesList/)
uses metadata from your monorepo and returns a Markdown list as string.

🎨 The output can be completely customized.

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_monorepo-packages-list/).

### Examples

#### Basic Usage

Assume you have two packages in your monorepo: `@scope/pkg-a` and `@scope/pkg-b`

```ts
import { monorepoPackagesList } from '@simbo/monorepo-packages-list';

const list = await monorepoPackagesList();

console.log(list);
```

Produces:

```md
There are currently _**2**_ packages managed in this repository:

- 📂 **`pkg-a`**
  - **Package A**

    > A sample package

    📦 `@scope/pkg-a` @ `1.2.3`

- 📂 **`pkg-b`**
  - **Package B**

    > Another sample package

    📦 `@scope/pkg-b` @ `3.2.1`
```

#### Custom URLs

You can provide URL functions via the `templateData` option:

```ts
import {
  monorepoPackagesList,
  type WorkspaceMetadata,
} from '@simbo/monorepo-packages-list';

const list = await monorepoPackagesList({
  templateData: {
    repoUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/user/repo/tree/main/${workspace.relativePath}/`,
    packageUrlFn: (workspace: WorkspaceMetadata) =>
      `https://www.npmjs.com/package/${workspace.name}`,
    docsUrlFn: (workspace: WorkspaceMetadata) =>
      `https://user.github.io/repo/modules/${workspace.name.replaceAll(/[^\da-z-]/gi, '_')}`,
    readmeUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/user/repo/blob/main/${workspace.relativePath}/README.md`,
    changelogUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/user/repo/blob/main/${workspace.relativePath}/CHANGELOG.md`,
  },
});
```

Produces a list with clickable links:

```md
There are currently _**2**_ packages managed in this repository:

- 📂 [**`pkg-a`**](https://github.com/user/repo/tree/main/packages/pkg-a/)
  - **Package A**

    > A sample package

    📦 [`@scope/pkg-a`](https://www.npmjs.com/package/@scope/pkg-a) @ `1.2.3`

    [README.md](https://github.com/user/repo/blob/main/packages/pkg-a/README.md)  • 
    [CHANGELOG.md](https://github.com/user/repo/blob/main/packages/pkg-a/CHANGELOG.md)  • 
    [Documentation](https://user.github.io/repo/modules/_scope_pkg-a)

- 📂 [**`pkg-b`**](https://github.com/user/repo/tree/main/packages/pkg-b/)
  - **Package B**

    > Another sample package

    📦 [`@scope/pkg-b`](https://www.npmjs.com/package/@scope/pkg-b) @ `3.2.1`

    [README.md](https://github.com/user/repo/blob/main/packages/pkg-b/README.md)  • 
    [CHANGELOG.md](https://github.com/user/repo/blob/main/packages/pkg-b/CHANGELOG.md)  • 
    [Documentation](https://user.github.io/repo/modules/_scope_pkg-b)
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
