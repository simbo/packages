# Find Bin

📦 [**`@simbo/find-bin`**](https://npmjs.com/package/@simbo/find-bin)

A lightweight utility to locate the executable path of a command.

It searches for binaries in local `node_modules/.bin` directories first, and
falls back to globally available executables.

## Features

- Check if a command exists and resolve its path

- Searches upward through `node_modules/.bin` folders

- Falls back to global executables via `which`

- Async, Promise-based API

- Fully typed with TypeScript

## Installation

Install `@simbo/find-bin` from the npm registry:

```bash
npm i [-D] @simbo/find-bin
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_find_bin/).

### Example

```ts
import { findBin } from '@simbo/find-bin';

const binPath = await findBin('eslint');

if (binPath) {
  console.log(`Found eslint: ${binPath}`);
} else {
  console.error('eslint not found.');
}
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
