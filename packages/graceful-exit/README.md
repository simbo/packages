# Graceful Exit

📦 [**`@simbo/graceful-exit`**](https://npmjs.com/package/@simbo/graceful-exit)

Gracefully terminate a Node.js process with **predictable exit codes**, **clear
console output**, and **optional teardown steps**.

It distinguishes between numeric exit codes, user‑initiated cancellations (e.g.,
Inquirer’s `ExitPromptError`), user‑facing errors with hints, and unknown
errors.

## Features

- ✅ **Simple API:** `gracefulExit(error?, exitCode?)` returns `Promise<never>`
  and exits the process.

- 🧹 **Teardown support:** Run any number of sync/async cleanup steps before
  exiting.

- 🧭 **Smart exit codes:**
  - Uses the **explicit** `exitCode` argument if provided.
  - Else, if `error` is a **non‑zero number**, uses that.
  - Else, **1** when exiting due to an error, **0** when clean.

- 🗣️ **User‑friendly output:** Pretty console messages via `@simbo/cli-output`
  helpers.

- 🙋 **Special cases handled:**
  - [Inquirer](https://www.npmjs.com/package/@inquirer/prompts)'s
    `ExitPromptError` → prints a "Prompt Cancelled" message.
  - [`UserFacingError`](https://www.npmjs.com/package/@simbo/user-facing-error)
    → prints message and an optional **hint** (custom or default).
  - Unknown values → passed through
    [`stringifyError()`](https://www.npmjs.com/package/@simbo/stringify-error).

## Installation

Install `@simbo/graceful-exit` from the npm registry:

```bash
npm i [-D] @simbo/graceful-exit
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_graceful_exit/).

### Basic

```ts
import { gracefulExit } from '@simbo/graceful-exit';

try {
  // Your code …
  if (shouldExitEarly) {
    await gracefulExit(); // exits with code 0
  }

  // … more work

  await gracefulExit(); // exits with code 0
} catch (error) {
  await gracefulExit(error); // exits with code 1
}
```

### With explicit exit code

```ts
await gracefulExit(new Error('Fatal'), 2); // prints error, exits with code 2
await gracefulExit(undefined, 2); // no output, exits with code 2
```

### With teardown steps

Register cleanup steps that run before the process exits.

```ts
import { gracefulExit } from '@simbo/graceful-exit';
import {
  onTeardown,
  offTeardown,
  type TeardownStep,
} from '@simbo/graceful-exit/teardown';

// Teardown may be sync or async:
const closeDatabase: TeardownStep = async () => database.close();

const trackExit: TeardownStep = async (error?: unknown, code?: number) =>
  (error || code) && (await metrics.trackExit(error, code));

const sayGoodbye: TeardownStep = () => console.log('Goodbye!');

// Register the teardown steps:
onTeardown(closeDatabase);
onTeardown(trackExit);
onTeardown(sayGoodbye);

// Now steps will be called on any graceful exit.

try {
  // …work
  // Optionally remove a teardown step:
  if (condition) {
    offTeardown(trackExit);
  }
  await gracefulExit();
} catch (error) {
  await gracefulExit(error);
}
```

Steps are stored in a `Set` and executed in **registration order**.

> [!NOTE]  
> If any teardown step fails during an otherwise successful exit (code `0`), the
> exit code is switched to `1` and the error is logged.

### Error type handling

```ts
await gracefulExit(2);
// → prints "Exiting. (Error #2)" and exits with 2

await gracefulExit(new Error('Oops'));
// → pretty‑printed via stringifyError

import { UserFacingError } from '@simbo/user-facing-error';
await gracefulExit(
  new UserFacingError('Invalid input', 'Use --help for usage'),
);
// → prints message + hint

// Inquirer cancellation (ExitPromptError)
import { ExitPromptError } from '@inquirer/core';
const e = new ExitPromptError();
await gracefulExit(e);
// → prints "Prompt Cancelled" and exits with 1
```

## Related Packages

- [@simbo/clirk](https://npmjs.com/package/@simbo/clirk)
- [@simbo/stringify-error](https://npmjs.com/package/@simbo/stringify-error)
- [@simbo/user-facing-error](https://npmjs.com/package/@simbo/user-facing-error)

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
