/* eslint-disable n/no-missing-import */
import {
  defineConfig,
  type TemplateData,
  type WorkspaceMetadata,
} from './packages/monorepo-packages-list-cli/dist/index.js';

const PACKAGES_EXCLUDED_FROM_DOCS = new Set(['changelog', 'tsconfig']);

export default defineConfig([
  {
    targetFile: 'README.md',
    templateFn: () => '',
    delimiter: '',
    before: (workspaces: WorkspaceMetadata[]): string => {
      const count = workspaces.length;
      return `There ${count === 1 ? 'is' : 'are'} currently _**${count}**_ package${count === 1 ? '' : 's'} managed in this repository.`;
    },
  },
  {
    targetFile: 'PACKAGES.md',

    templateFn: async (workspace: WorkspaceMetadata, data: TemplateData): Promise<string> => {
      const { name, title, version, description, folderName } = workspace;
      const { repoUrlFn, packageUrlFn, docsUrlFn, readmeUrlFn, changelogUrlFn } = data as Required<TemplateData>;

      const repoUrl = await repoUrlFn(workspace);
      const packageUrl = await packageUrlFn(workspace);
      const docsUrl = await docsUrlFn(workspace);
      const readmeUrl = await readmeUrlFn(workspace);
      const changelogUrl = await changelogUrlFn(workspace);

      const folder = repoUrl ? `[**\`./packages/${folderName}\`**](${repoUrl})` : `**\`./packages/${folderName}\`**`;
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
      repoUrlFn: (workspace: WorkspaceMetadata) =>
        `https://github.com/simbo/packages/tree/main/${workspace.relativePath}/`,

      packageUrlFn: (workspace: WorkspaceMetadata): string | undefined => {
        if (workspace.private) return;
        return `https://www.npmjs.com/package/${workspace.name}`;
      },

      docsUrlFn: (workspace: WorkspaceMetadata): string | undefined => {
        if (PACKAGES_EXCLUDED_FROM_DOCS.has(workspace.folderName)) return;
        return `https://simbo.codes/packages/modules/${workspace.name.replaceAll(/[^\da-z-]/gi, '_')}/`;
      },

      readmeUrlFn: (workspace: WorkspaceMetadata) =>
        `https://github.com/simbo/packages/blob/main/${workspace.relativePath}/README.md`,

      changelogUrlFn: (workspace: WorkspaceMetadata) =>
        `https://github.com/simbo/packages/blob/main/${workspace.relativePath}/CHANGELOG.md`,
    },
  },
]);
