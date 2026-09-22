# Plural

📦 [**`@simbo/plural`**](https://npmjs.com/package/@simbo/plural)

A lightweight utility for pluralizing words based on a count.

It supports irregular forms and custom output formatting.

## Features

- Pluralize words automatically (adds "s" by default).

- Handle irregular plural forms (e.g., "child" → "children").

- Flexible output templates with placeholders for count and word.

- Fully typed API with TypeScript support.

- Zero dependencies.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/plural` from the npm registry:

```bash
npm i [-D] @simbo/plural
```

## Usage

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_plural/).

String counts are converted with `Number` and truncated toward zero. Invalid
strings fall back to zero: `"2items"` becomes `0`, while `"1e2"` becomes `100`.
Numeric counts are used as provided. To apply a different parsing strategy,
convert the string yourself before calling `plural`.

Words are inserted literally, including dollar-sign sequences such as `$&` and
`$$`. Each call replaces only the first `%d` and `%s` placeholder.

### Examples

```ts
import { plural } from '@simbo/plural';

// Default pluralization
plural(1, 'Apple'); // -> "1 Apple"
plural(2, 'Apple'); // -> "2 Apples"

// Irregular plurals
plural(1, 'Child', 'Children'); // -> "1 Child"
plural(2, 'Child', 'Children'); // -> "2 Children"

// Custom templates
plural(1, 'Package', undefined, '**%d** 📦 %s');
// -> "**1** 📦 Package"
plural(2, 'Package', undefined, '**%d** 📦 %s');
// -> "**2** 📦 Packages"

// Contextual sentences
plural(1, 'Person', 'People', 'There is %d %s here.');
// -> "There is 1 Person here."
plural(2, 'Person', 'People', 'There are %d %s here.');
// -> "There are 2 People here."

// Reusing template output
let output = '%d %s (%d %s)';
output = plural(2, 'Directory', 'Directories', output);
// -> "2 Directories (%d %s)"
output = plural(3, 'File', undefined, output);
// -> "2 Directories (3 Files)"
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
