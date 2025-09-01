# Monorepo Packages List CLI

📦
[**`@simbo/monorepo-packages-list-cli`**](https://npmjs.com/package/@simbo/monorepo-packages-list-cli)

A CLI that generates a list of monorepo packages with metadata and injects it
into a markdown file.

Uses
[`@simbo/monorepo-packages-list`](https://npmjs.com/package/@simbo/monorepo-packages-list)
as a library.

## Installation

Install `@simbo/monorepo-packages-list-cli` from the npm registry:

```bash
npm i [-D|-g] @simbo/monorepo-packages-list-cli
```

Alternatively, run it using `npx` or a similar tool:

```bash
npx @simbo/monorepo-packages-list-cli
```

## Usage

### Minimum Setup

In the `README.md` file of your monorepo, add a HTML comment marker to inject
the packages list:

```md
<!-- PACKAGES -->
<!-- /PACKAGES -->
```

Run the CLI to generate the packages list:

```bash
npx @simbo/monorepo-packages-list-cli
```

A package list will be injected into the HTML comment markers.

### Configuration File

For customizing the output, create a configuration file in the root of your
monorepo.

Use one of the following default config file names or provide a custom one using
`--config=<FILE>`:

- `monorepo-packages-list.config.ts`
- `packages-list.config.ts`
- `monorepo-packages-list.config.js`
- `packages-list.config.js`

The configuration file should export a `Config` object or an array of `Config`
objects.

A `Config` object can contain all options of
[`@simbo/monorepo-packages-list`](https://npmjs.com/package/@simbo/monorepo-packages-list)
and an optional `targetFile` path as alternative to using CLI parameters.

#### Example for Custom URLs

This configuration simply enhances the default template with custom URLs.

```ts
import {
  defineConfig,
  type WorkspaceMetadata,
} from '@simbo/monorepo-packages-list-cli';

export default defineConfig({
  templateData: {
    repoUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/USER/REPO/tree/main/${workspace.relativePath}/`,
    packageUrlFn: (workspace: WorkspaceMetadata) =>
      workspace.private
        ? undefined
        : `https://www.npmjs.com/package/${workspace.name}`,
    docsUrlFn: (workspace: WorkspaceMetadata) =>
      `https://USER.github.io/REPO/modules/${workspace.name.replaceAll(/[^\da-z-]/gi, '_')}/`,
    readmeUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/USER/REPO/blob/main/${workspace.relativePath}/README.md`,
    changelogUrlFn: (workspace: WorkspaceMetadata) =>
      `https://github.com/USER/REPO/blob/main/${workspace.relativePath}/CHANGELOG.md`,
  },
});
```

#### Advanced Example for Multiple Files

This example uses a full custom template and edits two files:

- `README.md` with a one-liner including a package count
- `README-PACKAGES.md` with a full list of packages and their details

```ts
import {
  defineConfig,
  type TemplateData,
  type WorkspaceMetadata,
} from '@simbo/monorepo-packages-list-cli';

export default defineConfig([
  {
    targetFile: 'README.md',
    templateFn: () => '',
    delimiter: '',
    before: (workspaces: WorkspaceMetadata[]) =>
      `There ${workspaces.length === 1 ? 'is' : 'are'} currently _**${workspaces.length}**_ package${workspaces.length === 1 ? '' : 's'} managed in this repository.`,
  },
  {
    targetFile: 'README-PACKAGES.md',
    templateFn: async (
      workspace: WorkspaceMetadata,
      data: TemplateData,
    ): Promise<string> => {
      const { name, title, version, description, folderName } = workspace;
      const {
        repoUrlFn,
        packageUrlFn,
        docsUrlFn,
        readmeUrlFn,
        changelogUrlFn,
      } = data as Required<TemplateData>;

      const repoUrl = await repoUrlFn(workspace);
      const packageUrl = await packageUrlFn(workspace);
      const docsUrl = await docsUrlFn(workspace);
      const readmeUrl = await readmeUrlFn(workspace);
      const changelogUrl = await changelogUrlFn(workspace);

      const folder = repoUrl
        ? `[**\`./packages/${folderName}\`**](${repoUrl})`
        : `**\`./packages/${folderName}\`**`;
      const pkg = packageUrl ? `[\`${name}\`](${packageUrl})` : `\`${name}\``;

      const links: string[] = [];
      if (readmeUrl) links.push(`[README.md](${readmeUrl})`);
      if (changelogUrl) links.push(`[CHANGELOG.md](${changelogUrl})`);
      if (docsUrl) links.push(`[Documentation](${docsUrl})`);

      return [
        `- ### **${title}**`,
        `  > ${description}`,
        `  📂 ${folder}`,
        `  📦 ${pkg} @ \`${version}\``,
        ...(links.length > 0 ? [`  ${links.join('  •  ')}`] : []),
      ].join('\n\n');
    },

    templateData: {
      // Same as previous example.
    },
  },
]);
```

## Related Packages

- [`@simbo/monorepo-packages-list`](https://npmjs.com/package/@simbo/monorepo-packages-list)
- [`@simbo/monorepo-utils`](https://npmjs.com/package/@simbo/monorepo-utils)

## License

[MIT © Simon Lepel](http://simbo.mit-license.org/2025/)
