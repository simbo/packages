# Simbo's TypeScript Configurations

📦 [**`@simbo/tsconfig`**](https://npmjs.com/package/@simbo/tsconfig)

Shared TypeScript configurations for TypeScript 5 and 6.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install `@simbo/tsconfig` from the npm registry:

```bash
npm i -D typescript @types/node @simbo/tsconfig
```

## Extendable Configurations

- `@simbo/tsconfig/base` Base configuration (see
  [tsconfig.base.json](./configs/tsconfig.base.json))

- `@simbo/tsconfig/node` Node.js specific configuration (see
  [tsconfig.node.json](./configs/tsconfig.node.json))

- `@simbo/tsconfig/browser` Browser specific configuration (see
  [tsconfig.browser.json](./configs/tsconfig.browser.json))

The Node.js configuration explicitly includes `@types/node`. Install it
alongside TypeScript when using `@simbo/tsconfig/node`. If your project needs
additional global types, list them together with `node` in
`compilerOptions.types`.

## Example

In your `tsconfig.json`:

```json
{
  "extends": "@simbo/tsconfig/node",
  "compilerOptions": {
    // add custom settings here
  }
}
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
