import type { WorkspaceMetadata } from '@simbo/monorepo-utils';
import { describe, expect, it } from 'vitest';

import { defaultTemplateFn } from './default-template-fn.js';
import type { TemplateData } from './monorepo-packages-list.types.js';

describe('defaultTemplateFn', () => {
  it('should generate the package list item', async () => {
    const workspace = {
      name: '@scope/pkg-a',
      title: 'Package A',
      version: '1.0.0',
      description: 'A sample package',
      folderName: 'pkg-a',
    } as WorkspaceMetadata;

    const result = await defaultTemplateFn(workspace, {});

    expect(result).not.toContain('undefined');
    expect(result).toBe(
      `- 📂 **\`pkg-a\`**

  - **Package A**

    > A sample package

    📦 \`@scope/pkg-a\` @ \`1.0.0\``,
    );
  });

  it('should make use of url functions from the template data', async () => {
    const workspace = {
      name: '@scope/pkg-a',
      title: 'Package A',
      version: '1.0.0',
      description: 'A sample package',
      folderName: 'pkg-a',
      relativePath: 'packages/pkg-a',
    } as WorkspaceMetadata;

    const data: Required<TemplateData> = {
      repoUrlFn: ({ relativePath }: WorkspaceMetadata) => `https://github.com/user/repo/tree/main/${relativePath}/`,
      packageUrlFn: ({ name }: WorkspaceMetadata) => `https://www.npmjs.com/package/${name}`,
      docsUrlFn: ({ name }: WorkspaceMetadata) =>
        `https://user.github.io/repo/modules/${name.replaceAll(/[^\da-z-]/gi, '_')}`,
      readmeUrlFn: ({ relativePath }: WorkspaceMetadata) =>
        `https://github.com/user/repo/blob/main/${relativePath}/README.md`,
      changelogUrlFn: ({ relativePath }: WorkspaceMetadata) =>
        `https://github.com/user/repo/blob/main/${relativePath}/CHANGELOG.md`,
    };

    const result = await defaultTemplateFn(workspace, data);

    const expectedLinks = [
      `[README.md](${(await data.readmeUrlFn(workspace)) as string})`,
      `[CHANGELOG.md](${(await data.changelogUrlFn(workspace)) as string})`,
      `[Documentation](${(await data.docsUrlFn(workspace)) as string})`,
    ];

    expect(result).not.toContain('undefined');
    expect(result).toBe(
      `- 📂 [**\`pkg-a\`**](${(await data.repoUrlFn(workspace)) as string})

  - **Package A**

    > A sample package

    📦 [\`@scope/pkg-a\`](${(await data.packageUrlFn(workspace)) as string}) @ \`1.0.0\`

    ${expectedLinks.join('  •  ')}`,
    );
  });
});
