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

## Ignored content

Fenced code blocks and inline code are excluded from spelling checks.

In `CHANGELOG.md` files, Git commit hashes of exactly seven hexadecimal
characters at the start of list entries followed by a colon are also ignored,
for example `- cebccff: Fix template rendering.` This covers
Changesets-generated changelogs without excluding their descriptions from
spelling checks.

Hexadecimal strings in other Markdown prose remain checked: ordinary words can
also consist entirely of hexadecimal letters. Use inline code for technical
identifiers in prose.

## License

[MIT © Simon Lepel](https://simbo.mit-license.org/2025/)
