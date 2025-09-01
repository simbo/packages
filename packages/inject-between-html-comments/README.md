# Inject Between HTML Comments

📦
[**`@simbo/inject-between-html-comments`**](https://npmjs.com/package/@simbo/inject-between-html-comments)

Inject content between HTML comment markers inside a string.

Useful for markdown manipulation, code generation, documentation updates, or
template modifications where placeholders are wrapped in comments.

## Features

- Replace content between all occurrences of matching HTML comment blocks

- Supports custom comment names (e.g., `<!-- INJECT:foo -->` …
  `<!-- /INJECT:foo -->`)

- Configurable options for inline vs. block insertion

- Optional trimming of injected content

- Fully typed with TypeScript

## Installation

Install `@simbo/inject-between-html-comments` from the npm registry:

```bash
npm i [-D] @simbo/inject-between-html-comments
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.codes/packages/modules/_simbo_inject-between-html-comments/).

### Example

```ts
import { injectBetweenHtmlComments } from '@simbo/inject-between-html-comments';

const content = `
# A Document

<!-- INJECT -->

Generated content.

<!-- /INJECT -->
`;

const result = injectBetweenHtmlComments(content, 'Hello World!');

/*
# A Document

<!-- INJECT -->

Hello World!

<!-- /INJECT -->
*/
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
