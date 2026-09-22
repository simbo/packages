# CLI Output

📦 [**`@simbo/cli-output`**](https://npmjs.com/package/@simbo/cli-output)

A collection of utilities for common CLI messages and output.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/cli-output` from the npm registry:

```bash
npm i [-D] @simbo/cli-output
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_cli-output/).

### Examples

```ts
import {
  failure,
  hintToHelp,
  line,
  success,
  terminated,
} from '@simbo/cli-output';

// Success message with a green "✔":
console.log(success(`Done.`));

// Failure message with a red "✖":
console.log(failure(`Failed.`));

// Termination message with cause:
console.log(terminated(`Received SIGINT`));

// Hint to use "<COMMAND> --help":
console.log(hintToHelp());

// Draw a line:
console.log(line());
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
