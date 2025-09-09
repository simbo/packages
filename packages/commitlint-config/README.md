# Simbo's Commitlint Configuration

📦
[**`@simbo/commitlint-config`**](https://npmjs.com/package/@simbo/commitlint-config)

A shared [commitlint](https://commitlint.js.org/) configuration based on the
[conventional commits](https://www.conventionalcommits.org/) standard.

## Installation

Install commitlint and the `@simbo/commitlint-config` from the npm registry:

```bash
npm i -D @commitlint/cli @simbo/commitlint-config
```

## Usage

Create a
[commitlint configuration](https://commitlint.js.org/reference/configuration.html)
file in the root of your project.

For example, `.commitlintrc.yml`:

```yaml
extends:
  - '@simbo/commitlint-config'
```

### Setup Git Hooks for Commitlint with Husky

- Install [husky](https://npmjs.com/package/husky):

  ```bash
  npm i -D husky
  ```

- Add `husky` command to your `package.json` scripts:

  ```json
      "prepare": "husky",
  ```

- Create `.husky/pre-commit`:

  ```bash
  ./node_modules/.bin/commitlint --edit $1
  ```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
