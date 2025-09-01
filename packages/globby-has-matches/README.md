# Globby Has Matches

📦
[**`@simbo/globby-has-matches`**](https://npmjs.com/package/@simbo/globby-has-matches)

A utility to glob using [globby](https://github.com/sindresorhus/globby) and
**exit early once a match is found**.

## Features

- Ensures further globbing is cancelled as soon as possible

- Returns `true` as soon as a matching file is found (no need to wait for the
  full scan)

- Optional matcher function for custom filtering logic

- Fully async, Promise-based API

- Fully typed with TypeScript

## Installation

Install `@simbo/globby-has-matches` from the npm registry:

```bash
npm i [-D] @simbo/globby-has-matches
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_globby-has-matches/).

### Example

```ts
import { globbyHasMatches } from 'globby-has-matches';

const hasMatches = await globbyHasMatches('.changesets/*.md');

if (hasMatches) {
  console.log('Found Changesets');
} else {
  console.log('No Changesets found');
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
