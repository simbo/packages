# User Facing Error

📦
[**`@simbo/user-facing-error`**](https://npmjs.com/package/@simbo/user-facing-error)

A custom `Error` class for creating **user-facing error messages**.

It supports additional _hints_ to guide users toward resolving issues, while
maintaining full compatibility with standard JavaScript `Error` behavior.

## Features

- Extends the native `Error` class
- Includes an optional hint (`string` or `true` for a generic hint)
- Supports
  [standard `ErrorOptions`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Error#options)
  including `cause`
- Static `from` method for wrapping other errors with a new message
- Fully typed TypeScript API
- One dependency
  ([`@simbo/stringify-error`](https://npmjs.com/package/@simbo/stringify-error))

## Installation

Install `@simbo/user-facing-error` from the npm registry:

```bash
npm i [-D] @simbo/user-facing-error
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_user-facing-error/).

### Examples

```ts
import { UserFacingError } from '@simbo/user-facing-error';

// Creating the simplest user-facing error:
throw new UserFacingError('Operation cancelled');

// Creating a basic user-facing error with a hint:
throw new UserFacingError('Invalid input', 'Use --help for usage information');

// Adding a generic hint:
// (You have to provide a hint when catching this error.)
throw new UserFacingError('Command failed', true);

// Using another error (or anything else) as `cause`:
const cause = new Error('Underlying error');
throw new UserFacingError('Top-level error', {
  cause,
  hint: 'Retry with valid credentials',
});

// Wrapping another error:
try {
  // some failing operation
} catch (err) {
  throw UserFacingError.from(
    err,
    'Operation failed',
    'Check your network connection',
  );
}
```

## Related Packages

- [@simbo/clirk](https://npmjs.com/package/@simbo/clirk)
- [@simbo/graceful-exit](https://npmjs.com/package/@simbo/graceful-exit)
- [@simbo/stringify-error](https://npmjs.com/package/@simbo/stringify-error)

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
