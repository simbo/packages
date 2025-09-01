# CLI Output

📦 [**`@simbo/cli-output`**](https://npmjs.com/package/@simbo/cli-output)

A collection utilities for common CLI messages and output.

## Installation

Install `@simbo/cli-output` from the npm registry:

```bash
npm i [-D] @simbo/cli-output
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_cli-output/).

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
