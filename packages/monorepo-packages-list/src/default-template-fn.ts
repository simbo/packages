import type { WorkspaceMetadata } from '@simbo/monorepo-utils';

import type { TemplateData } from './monorepo-packages-list.types.js';

/**
 * The default template function to render a monorepo package list entry.
 *
 * @param workspace - The workspace metadata.
 * @param data - The template data.
 * @returns The rendered template string.
 */
export async function defaultTemplateFn(workspace: WorkspaceMetadata, data: TemplateData): Promise<string> {
  const { name, title, version, description, folderName } = workspace;
  const { repoUrlFn, packageUrlFn, docsUrlFn, readmeUrlFn, changelogUrlFn } = data;

  const repoUrl = typeof repoUrlFn === 'function' ? await repoUrlFn(workspace) : undefined;
  const packageUrl = typeof packageUrlFn === 'function' ? await packageUrlFn(workspace) : undefined;
  const docsUrl = typeof docsUrlFn === 'function' ? await docsUrlFn(workspace) : undefined;
  const readmeUrl = typeof readmeUrlFn === 'function' ? await readmeUrlFn(workspace) : undefined;
  const changelogUrl = typeof changelogUrlFn === 'function' ? await changelogUrlFn(workspace) : undefined;

  const folder = repoUrl ? `[**\`${folderName}\`**](${repoUrl})` : `**\`${folderName}\`**`;
  const pkg = packageUrl ? `[\`${name}\`](${packageUrl})` : `\`${name}\``;

  const links: string[] = [];
  if (readmeUrl) links.push(`[README.md](${readmeUrl})`);
  if (changelogUrl) links.push(`[CHANGELOG.md](${changelogUrl})`);
  if (docsUrl) links.push(`[Documentation](${docsUrl})`);

  return [
    `- 📂 ${folder}`,
    `  - **${title}**`,
    `    > ${description}`,
    `    📦 ${pkg} @ \`${version}\``,
    ...(links.length > 0 ? [`    ${links.join('  •  ')}`] : []),
  ].join('\n\n');
}
