# Find Up Package

📦
[**`@simbo/find-up-package`**](https://npmjs.com/package/@simbo/find-up-package)

A utility for finding an npm package in the directory hierarchy that matches
specific criteria.

It uses [find-up](https://github.com/sindresorhus/find-up) to walk up the
filesystem, checking each `package.json` until it finds a match.

⸻

Features

- Search upwards for a `package.json` file matching custom conditions

- Configurable matcher function for defining what counts as a match

- Returns the found directory path and the parsed `package.json`

- Optionally normalize the `package.json` using npm's
  [`normalize-package-data`](https://github.com/npm/normalize-package-data)

- Async, Promise-based API

- Fully typed with TypeScript

## Installation

Install `@simbo/find-up-package` from the npm registry:

```bash
npm i [-D] @simbo/find-up-package
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_find-up-package/).

### Example

```ts
import { findUpPackage } from '@simbo/find-up-package';

const result = await findUpPackage();

if (result) {
  console.log(`Found package.json in: ${result.path}`);
  console.log(result.packageJson.name, result.packageJson.version);
}
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
