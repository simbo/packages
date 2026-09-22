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

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/import-meta-path` from the npm registry:

```bash
npm i [-D] @simbo/import-meta-path
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_import-meta-path/).

Fallbacks apply only to `null` or `undefined`. An explicitly supplied empty
`dirname` or `filename` is not treated as missing.

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
