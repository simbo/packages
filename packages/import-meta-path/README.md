# Import Meta Path

📦
[**`@simbo/import-meta-path`**](https://npmjs.com/package/@simbo/import-meta-path)

A small utility for safely deriving absolute file and directory paths from
`import.meta` in Node.js, with a consistent fallback order.

## Features

- Derive absolute **directory** or **file** path from `import.meta`
- Consistent fallback order (`dirname` → `filename` → `url`)
- Node.js ESM-only, works as a drop-in replacement for `__dirname` /
  `__filename`
- Zero dependencies

## Installation

Install `@simbo/import-meta-path` from the npm registry:

```bash
npm i [-D] @simbo/import-meta-path
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_import-meta-path/).

### Example

```ts
import { importMetaPath } from '@simbo/import-meta-path';

// get the absolute directory path from import.meta
const dirPath = importMetaPath(import.meta);
// if importMeta has dirname → returned directly
// if only filename → dirname(filename)
// otherwise → dirname(fileURLToPath(url))

// get the absolute file path from import.meta
const filePath = importMetaPath(import.meta, 'file');
// if only filename → returned directly
// otherwise → fileURLToPath(url)
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
