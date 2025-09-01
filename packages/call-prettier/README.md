# Call Prettier

📦 [**`@simbo/call-prettier`**](https://npmjs.com/package/@simbo/call-prettier)

A lightweight utility for finding and invoking the
[Prettier](https://prettier.io/) binary on files, using the appropriate
contextual settings of your project.

It ensures that the correct Prettier instance is executed, whether installed
locally or globally.

## Features

- Locates the correct Prettier binary (local `node_modules/.bin` first, then
  global)

- Calls Prettier in `write` or `check` mode

- Supports custom working directories

- Respects or ignores `.prettierignore` depending on options

- Fully typed with TypeScript

- Built on top of [`execa`](https://npmjs.com/package/execa) for reliable
  process execution

## Installation

Install `@simbo/call-prettier` from the npm registry:

```bash
npm i [-D] @simbo/call-prettier
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_call-prettier/).

```ts
import { callPrettier } from '@simbo/call-prettier';

await callPrettier('src/**/*.ts', {
  mode: 'check', // defaults to 'write'
  workingDir: process.cwd(), // optional
  disableIgnores: false, // optional
});
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
