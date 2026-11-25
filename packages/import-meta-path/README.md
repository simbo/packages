# Import Meta Path

📦
[**`@simbo/import-meta-path`**](https://npmjs.com/package/@simbo/import-meta-path)

> [!WARNING]
>
> **This package is deprecated and no longer maintained.** Use
> `import.meta.dirname` and `import.meta.filename`, which are available in all
> Node.js versions that this package supports.

A small utility for safely deriving absolute file and directory paths from
`import.meta` in Node.js, with a consistent fallback order.

## Migration

Replace the calls with the built-in `import.meta` properties and remove the
dependency:

```ts
// before
import { importMetaPath } from '@simbo/import-meta-path';

const dirPath = importMetaPath(import.meta);
const filePath = importMetaPath(import.meta, 'file');

// after
const dirPath = import.meta.dirname;
const filePath = import.meta.filename;
```

```bash
npm rm @simbo/import-meta-path
```

Both properties are only set for modules loaded from `file:` URLs, which is the
only case this package supported.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Previous Usage

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

Fallbacks apply only to `null` or `undefined`. An explicitly supplied empty
`dirname` or `filename` is not treated as missing.

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
