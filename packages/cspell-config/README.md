# Simbo's CSpell Configuration

📦 [**`@simbo/cspell-config`**](https://npmjs.com/package/@simbo/cspell-config)

A shared [CSpell](https://cspell.org/) configuration.

## Requirements

Requires Node.js `^22.22.2 || ^24.15.0 || >=26.0.0`.

## Installation

Install cspell and `@simbo/cspell-config` from the npm registry:

```bash
npm i -D cspell @simbo/cspell-config
```

CSpell 9 and 10 are supported. Both require the Node.js version specified above
when used with this configuration; Node.js 20 is no longer supported.

## Usage

Create a [CSpell configuration](https://cspell.org/docs/Configuration) file in
your project root and import the shared configuration.

For example, a `.cspell.yml`:

```yml
import: '@simbo/cspell-config'
```

Add `cspell` command to your `package.json` scripts:

```json
    "check:spelling": "cspell",
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
