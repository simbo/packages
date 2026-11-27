# Package Utilities

📦 [**`@simbo/package-json`**](https://npmjs.com/package/@simbo/package-json)

A set of utilities for working with package.json files.

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/package-json` from the npm registry:

```bash
npm i [-D] @simbo/package-json
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_package-json/).

```ts
import {
  readPackageJson,
  updatePackageJson,
  writePackageJson,
} from '@simbo/package-json';

// read ./package.json, or the package.json in or at a given path
const packageJson = await readPackageJson('/path/to/package');

// write a package.json, keeping the indentation of an existing file
await writePackageJson('/path/to/package', {
  name: 'my-package',
  version: '1.0.0',
});

// change an existing package.json in place and sort its keys
await updatePackageJson(
  '/path/to/package',
  packageJson => {
    packageJson.version = '1.1.0';
    delete packageJson.private;
  },
  { sort: true },
);
```

- `readPackageJson()` reads with
  [`read-pkg`](https://github.com/sindresorhus/read-pkg) and returns the content
  without normalization.
- `writePackageJson()` writes with
  [`write-package`](https://github.com/sindresorhus/write-package): atomically,
  creating missing directories, keeping the indentation and trailing newline of
  an existing file, and with two spaces for new files unless `indent` is set.
  Empty dependency objects are removed and dependencies are sorted.
- `updatePackageJson()` reads an existing file, lets the updater change the
  object in place or return a new one, and writes it like `writePackageJson()`.
- `sortPackageJson()` returns a sorted copy with
  [`sort-package-json`](https://github.com/keithamus/sort-package-json).
  Top-level keys follow the order of the `@simbo` packages (`name`,
  `description`, `version`, …, `scripts`, `peerDependencies`, `dependencies`,
  `devDependencies`), unless `sortOrder` is set. Scripts are grouped by colons
  with the main script first, such as `build`, `build:prod`, `test`.
- With `sort: true`, `writePackageJson()` and `updatePackageJson()` sort before
  writing.

All functions reject with an `Error` whose message starts with
`Failed to read package.json:` or `Failed to write package.json:` and whose
`cause` is the original error. Errors of the updater are passed through.

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
