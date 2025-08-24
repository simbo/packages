# Clirk - The CLI Clerk

[📦 **`@simbo/clirk`**](https://npmjs.com/package/@simbo/clirk)

A utility that **makes creating Node.js CLIs easier** by providing common
functionality out of the box, with excellent performance and a minimal
footprint.

## Features

- ⚙️ Parses command-line arguments with
  [`minimist`](https://www.npmjs.com/package/minimist)

- ℹ️ Auto-handles `--help` and `--version` flags (unless overridden)

- 📝 Provides formatted help and version messages

- 🛑 Handles `SIGINT` (<kbd>Ctrl</kbd>+<kbd>C</kbd>) gracefully with
  customizable messages

- 📊 Exposes structured metadata (title, description, parameters, options,
  examples)

- 🏎️ Optimized for performance with a minimal dependency footprint

- 📘 Fully typed with TypeScript

## Installation

Install `@simbo/clirk` from the npm registry:

```bash
npm i [-D] @simbo/clirk
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_clirk/).

### Define Your CLI

The
[`ClirkOptions`](https://simbo.codes/packages/interfaces/_simbo_clirk..ClirkOptions/)
interface provides flexible configuration for parsing arguments, generating help
and version output, and customizing overall CLI behavior.

📄 **`./cli-config.ts`**

```ts
import type { ClirkOptions } from '@simbo/clirk';

export const CLI_CONFIG: ClirkOptions = {
  importMetaDirname: import.meta.dirname, // required for CLI module context
  argsOptions: {
    // minimist options for parsing command line arguments
  },
  name: 'my-cli',
  title: 'My CLI Tool',
  description: 'An awesome CLI tool.',
  // Add more details here for better --help output.
};
```

> [!NOTE]  
> If your environment does not support `import.meta.dirname`, use another way to
> resolve the absolute directory path of your CLI module, such as
> `dirname(fileURLToPath(import.meta.url))`.

#### Bootstrap Your CLI

The
[`ClirkContext`](https://simbo.codes/packages/interfaces/_simbo_clirk..ClirkContext/)
returned by
[`clirk()`](https://simbo.codes/packages/functions/_simbo_clirk..clirk/)
contains the parsed arguments and relevant CLI metadata.

📄 **`./main.ts`**

```ts
import { clirk } from '@simbo/clirk';
import { CLI_CONFIG } from './cli-config.js';

export async function main() {
  const { args } = await clirk(CLI_CONFIG);
  // Arguments are parsed.
  // --help and --version flags are handled automatically.
  // SIGINT handling is set up.
}
```

## Error Handling with `clitch`

In your entrypoint script, wrap the main function with
[`clitch()`](https://simbo.codes/packages/functions/_simbo_clirk.clitch.clitch/)
to log errors consistently and exit the process gracefully.

📄 **`./cli.ts`** _(set as `bin` in `package.json`)_

```ts
#!/usr/bin/env node
import { clitch } from '@simbo/clirk/clitch';
import { main } from './main.js';

await clitch(main);
```

## Related Packages

- [@simbo/graceful-exit](https://npmjs.com/package/@simbo/graceful-exit)
- [@simbo/stringify-error](https://npmjs.com/package/@simbo/stringify-error)
- [@simbo/user-facing-error](https://npmjs.com/package/@simbo/user-facing-error)

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
