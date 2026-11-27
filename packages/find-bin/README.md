# Find Bin

📦 [**`@simbo/find-bin`**](https://npmjs.com/package/@simbo/find-bin)

A lightweight utility to locate the executable path of a command.

It searches for binaries in local `node_modules/.bin` directories first, and
falls back to the directories in `PATH`.

## Features

- Check if a command exists and resolve its path

- Searches upward through `node_modules/.bin` folders

- Falls back to the directories in `PATH`, without a system `which` binary

- Resolves names with a path separator, such as `./bin/tool`, against the
  working directory

- Async, Promise-based API

- Fully typed with TypeScript

## Requirements

Requires Node.js `^24.15.0 || >=26.0.0`.

Tested on Linux and macOS only. On Windows, the lookup follows `PATHEXT` and
also checks the working directory of the process first, but it is not tested
there.

## Installation

Install `@simbo/find-bin` from the npm registry:

```bash
npm i [-D] @simbo/find-bin
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_find-bin/).

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

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
