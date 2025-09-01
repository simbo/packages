# Stringify Error

📦
[**`@simbo/stringify-error`**](https://npmjs.com/package/@simbo/stringify-error)

A lightweight utility that converts any error-like value into a safe,
human-readable string.

Designed for robust error handling in logs, CLI output, or user-facing messages.

## Features

- Handles any input type (`unknown`) gracefully

- Extracts message from `Error` objects

- Falls back to `toString()` where available

- Provides meaningful defaults for non-standard values

- Fully typed with TypeScript

- Zero dependencies

## Installation

Install `@simbo/stringify-error` from the npm registry:

```bash
npm i [-D] @simbo/stringify-error
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_stringify-error/).

### Example

Use `stringifyError` in your error handling:

```ts
import { stringifyError } from '@simbo/stringify-error';

try {
  // Some things that may throw
} catch (error: unknown) {
  console.error(`Failed: ${stringifyError(error)}`);
}
```

### Input and Output

The following table is a simplified view of how `stringifyError` tests the input
and creates respective output:

| Input (`error: unknown`)            | Output (`string`)                                |
| ----------------------------------- | ------------------------------------------------ |
| Object with a `message` string      | `error.message`                                  |
| Object with a `toString` method     | `error.toString()`                               |
| Other object                        | `` `Unknown Error (${JSON.stringify(error)})` `` |
| Non-string primitive (number, etc.) | `` `Unknown Error (${String(error)})` ``         |
| Empty string                        | `` `Unknown Error ("")` ``                       |
| Non-empty string                    | `error`                                          |

## Related Packages

- [@simbo/clirk](https://npmjs.com/package/@simbo/clirk)
- [@simbo/graceful-exit](https://npmjs.com/package/@simbo/graceful-exit)
- [@simbo/user-facing-error](https://npmjs.com/package/@simbo/user-facing-error)

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
