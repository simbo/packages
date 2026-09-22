# Rollup GitHub Actions Config

📦
[**`@simbo/rollup-github-actions-config`**](https://npmjs.com/package/@simbo/rollup-github-actions-config)

A rollup configuration for building GitHub Actions written in TypeScript/ESM.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/rollup-github-actions-config` from the npm registry:

```bash
npm i -D rollup typescript @simbo/rollup-github-actions-config
```

## Usage

Create a `rollup.config.js` file in your project root:

```js
import { getConfig } from '@simbo/rollup-github-actions-config';

export default getConfig();
```

In your `package.json`, add a build script:

```json
    "build": "rollup -c"
```

For a complete API reference, see the
[documentation](https://simbo.de/packages/modules/_simbo_rollup-github-actions-config/).

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
