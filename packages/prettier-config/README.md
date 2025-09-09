# Simbo's Prettier Configuration

📦
[**`@simbo/prettier-config`**](https://npmjs.com/package/@simbo/prettier-config)

A shared [Prettier](https://prettier.io/) configuration.

## Installation

Install Prettier, the required plugins, and the `@simbo/prettier-config` from
the npm registry:

```bash
npm i -D prettier @ianvs/prettier-plugin-sort-imports prettier-plugin-organize-attributes @simbo/prettier-config
```

## Usage

Create a [Prettier configuration file](https://prettier.io/docs/configuration)
in the root of your project.

```bash
echo '"@simbo/prettier-config"' > .prettierrc
```

And your done. 🍻

### Example `.prettierrc`

```json
"@simbo/prettier-config"
```

### Example `.prettierrc.js`

Extending the shared configuration is only possible using JavaScript or
TypeScript.

```js
import simboPrettierConfig from '@simbo/prettier-config';

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
export default {
  ...simboPrettierConfig,
  // add custom settings here
};
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
