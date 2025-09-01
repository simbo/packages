# Simbo's ESLint Configurations

📦 [**`@simbo/eslint-config`**][`@simbo/eslint-config`]

Shared [ESLint] configurations for different environments and technology stacks
with utilities for configuration customization.

9️⃣ Requires **ESLint v9+** (_"flat config"_ format).

This package includes a curated set of ESLint-related dependencies:

- [`@eslint/js`]
- [`@eslint/config-helpers`]
- [`typescript-eslint`]
- [`eslint-plugin-unicorn`]
- [`eslint-plugin-n`]
- [`eslint-plugin-jsdoc`]
- [`eslint-config-prettier`]
- [`globals`]

Installing `@simbo/eslint-config` automatically includes these dependencies —
you do not need to add them separately.

## Installation

Install ESLint and `@simbo/eslint-config` from the npm registry:

```bash
npm i -D eslint @simbo/eslint-config
```

## Usage

Add one or more configurations to your eslint configuration file (e.g.
`eslint.config.ts`).

See [examples](#examples) below, or consult the [API reference].

> [!TIP]  
> Inspect and debug your configuration with the [ESLint Config
> Inspector][`@eslint/config-inspector`]:
>
> ```bash
> npx @eslint/config-inspector@latest --config=./eslint.config.ts
> ```

## Configurations

**All configuration exports are [`ConfigsRecord`] objects.**

A `ConfigsRecord` provides the following environments and variations:

```ts
import type { Linter } from 'eslint';

interface ConfigsRecord {
  node: {
    recommended: Linter.Config[]; // Recommended for Node.js projects
  };
  browser: {
    recommended: Linter.Config[]; // Recommended for browser projects
  };
}
```

### All-in-One Configurations

⭐️ Use the all-in-one `configs` export, which combines all configuration
supersets:

```ts
import { configs } from '@simbo/eslint-config';
```

### Combinable Configurations

#### Superset Configurations

Each of the following supersets extends curated third-party configurations:

- **Superset of [`@eslint/js`]**  
  _Exported as_ [`eslintJsConfigs`]

  ```ts
  import { eslintJsConfigs } from '@simbo/eslint-config/eslint-js';
  ```

- **Superset of [`typescript-eslint`]**  
  _Exported as_ [`typescriptEslintConfigs`]

  ```ts
  import { typescriptEslintConfigs } from '@simbo/eslint-config/typescript-eslint';
  ```

- **Superset of [`eslint-plugin-unicorn`]**  
  _Exported as_ [`unicornConfigs`]

  ```ts
  import { unicornConfigs } from '@simbo/eslint-config/unicorn';
  ```

- **Superset of [`eslint-plugin-jsdoc`]**  
  _Exported as_ [`jsdocConfigs`]

  ```ts
  import { jsdocConfigs } from '@simbo/eslint-config/jsdoc';
  ```

- **Superset of [`eslint-plugin-n`]**  
  _Exported as_ [`nConfigs`]

  ```ts
  import { nConfigs } from '@simbo/eslint-config/n';
  ```

- **Superset of [`eslint-config-prettier`]**  
  _Exported as_ [`prettierConfigs`]

  ```ts
  import { prettierConfigs } from '@simbo/eslint-config/prettier';
  ```

#### Custom Configurations

- **Overrides tailored for spec files and mocks.**  
  _Exported as_ [`testingConfigs`]

  ```ts
  import { testingConfigs } from '@simbo/eslint-config/testing';
  ```

## Utilities

Utilities can be imported from either `@simbo/eslint-config` or
`@simbo/eslint-config/utils`.

- [**`setRulesToOff`**][`setRulesToOff`]

  Creates a rule set with all specified rules turned off.

- [**`noRestrictedGlobalsRule`**][`noRestrictedGlobalsRule`]

  Creates a rule set with ESLint's [`no-restricted-globals`] rule to restrict
  use of all global variables in a specific context, with an optional
  allow-list.

- **`defineConfig`** and **`globalIgnores`**

  Re-exports from [`@eslint/config-helpers`].

- **`globals`**

  Re-export from [`globals`].

## Examples

### Node.js Project

Using the recommended configuration for Node.js projects:

<!-- prettier-ignore -->
```ts
import { configs, globals, defineConfig, globalIgnores } from '@simbo/eslint-config';

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/']),
  {
    // Set up language options for TypeScript with globals for Node.js.
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.config.js', '.*.js'],
      },
    },
    // Extend the recommended Node.js configuration.
    extends: [configs.node.recommended],
    rules: {
      // Your rule overrides can be added here.
    },
  },
  // Additional configurations can be added here.
]);
```

### Browser Project

Using the recommended configuration for browser projects:

<!-- prettier-ignore -->
```ts
import { configs, globals, defineConfig, globalIgnores } from '@simbo/eslint-config';

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/']),
  {
    // Set up language options for TypeScript with globals for browser.
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.config.js', '.*.js'],
      },
    },
    // Extend the recommended browser configuration.
    extends: [configs.browser.recommended],
    rules: {
      // Your rule overrides can be added here.
    },
  },
  // Additional configurations can be added here.
]);
```

### Combined Configuration Supersets

In this example, we create a combined configuration for a browser environment
with support for JavaScript, TypeScript, and Prettier.

<!-- prettier-ignore -->
```ts
import { eslintJsConfigs } from '@simbo/eslint-config/eslint-js';
import { typescriptEslintConfigs } from '@simbo/eslint-config/typescript-eslint';
import { prettierConfigs } from '@simbo/eslint-config/prettier';
import { globals, defineConfig, globalIgnores } from '@simbo/eslint-config/utils';

export default defineConfig([
  globalIgnores(['**/dist/', '**/coverage/']),
  {
    // Set up language options for TypeScript with globals for browser.
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.config.js', '.*.js'],
      },
    },
    // Extend combinable configuration supersets for browser.
    extends: [
      eslintJsConfigs.browser.recommended,
      typescriptEslintConfigs.browser.recommended,
      prettierConfigs.recommended,
    ],
    rules: {
      // Your rule overrides can be added here.
    },
  },
  // Additional configurations can be added here.
]);
```

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)

[ESLint]: https://eslint.org/
[`no-restricted-globals`]: https://eslint.org/docs/rules/no-restricted-globals
[`@simbo/eslint-config`]: https://npmjs.com/package/@simbo/eslint-config
[`@eslint/js`]: https://npmjs.com/package/@eslint/js
[`@eslint/config-helpers`]: https://npmjs.com/package/@eslint/config-helpers
[`@eslint/config-inspector`]: https://npmjs.com/package/@eslint/config-inspector
[`typescript-eslint`]: https://npmjs.com/package/typescript-eslint
[`eslint-plugin-unicorn`]: https://npmjs.com/package/eslint-plugin-unicorn
[`eslint-plugin-n`]: https://npmjs.com/package/eslint-plugin-n
[`eslint-plugin-jsdoc`]: https://npmjs.com/package/eslint-plugin-jsdoc
[`eslint-config-prettier`]: https://npmjs.com/package/eslint-config-prettier
[`globals`]: https://npmjs.com/package/globals
[API reference]:
  https://simbo.codes/simbos-packages/modules/_simbo_eslint-config/
[`ConfigsRecord`]:
  https://simbo.codes/simbos-packages/interfaces/_simbo_eslint-config..ConfigsRecord/
[`eslintJsConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.eslint-js.eslintJsConfigs/
[`typescriptEslintConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.typescript-eslint.typescriptEslintConfigs/
[`unicornConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.unicorn.unicornConfigs/
[`jsdocConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.jsdoc.jsdocConfigs/
[`nConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.n.nConfigs/
[`prettierConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.prettier.prettierConfigs/
[`testingConfigs`]:
  https://simbo.codes/simbos-packages/variables/_simbo_eslint-config.testing.testingConfigs/
[`noRestrictedGlobalsRule`]:
  https://simbo.codes/simbos-packages/functions/_simbo_eslint-config..noRestrictedGlobalsRule/
[`setRulesToOff`]:
  https://simbo.codes/simbos-packages/functions/_simbo_eslint-config..setRulesToOff/
