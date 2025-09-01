# Accessible

📦 [**`@simbo/accessible`**](https://npmjs.com/package/@simbo/accessible)

A lightweight utility library that provides reliable checks for file system
accessibility.

It helps you determine whether files or directories are **existing**,
**readable**, **writable**, or **executable** — with a simple, async-first API.

## Features

- Check if a **file** or **directory** exists

- Verify if a path is **readable**, **writable**, or **executable**

- Minimal and dependency-free

- Fully typed TypeScript API

## Installation

Install `@simbo/accessible` from the npm registry:

```bash
npm i [-D] @simbo/accessible
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_accessible/).

Use the provided functions in your code:

```ts
import { isReadableFile, isWritableDirectory } from '@simbo/accessible';

if (await isReadableFile('path/to/file')) {
  console.log('File is readable');
}

if (await isWritableDirectory('path/to/directory')) {
  console.log('Directory is writable');
}
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
