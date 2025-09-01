# Simbo's TypeScript Configurations

📦 [**`@simbo/tsconfig`**](https://npmjs.com/package/@simbo/tsconfig)

Shared TypeScript configurations.

## Installation

Install `@simbo/tsconfig` from the npm registry:

```bash
npm i -D @simbo/tsconfig
```

## Extendable Configurations

- `@simbo/tsconfig/base` Base configuration (see
  [tsconfig.base.json](./tsconfig.base.json))

- `@simbo/tsconfig/node` Node.js specific configuration (see
  [tsconfig.node.json](./tsconfig.node.json))

- `@simbo/tsconfig/browser` Browser specific configuration (see
  [tsconfig.browser.json](./tsconfig.browser.json))

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
