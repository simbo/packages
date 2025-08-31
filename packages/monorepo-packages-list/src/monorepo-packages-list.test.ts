import { cwd } from 'node:process';

import type { WorkspaceMetadata } from '@simbo/monorepo-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { monorepoPackagesList } from './monorepo-packages-list.js';
import type { TemplateData } from './monorepo-packages-list.types.js';

vi.mock('@simbo/monorepo-utils', () => ({
  readWorkspaces: vi.fn().mockResolvedValue([
    { name: 'pkg-b', relativePath: 'packages/pkg-b' },
    { name: 'pkg-a', relativePath: 'packages/pkg-a' },
  ]),
}));

vi.mock('./default-template-fn.js', () => ({
  defaultTemplateFn: vi.fn().mockImplementation((workspace: WorkspaceMetadata) => `- ${workspace.name}`),
}));

vi.mock('./default-before-fn.js', () => ({
  defaultBeforeFn: vi
    .fn()
    .mockImplementation(
      (workspaces: WorkspaceMetadata[]) => `${workspaces.length} package${workspaces.length === 1 ? '' : 's'}:\n\n`,
    ),
}));

const { readWorkspaces } = vi.mocked(await import('@simbo/monorepo-utils'));
const { defaultBeforeFn } = vi.mocked(await import('./default-before-fn.js'));
const { defaultTemplateFn } = vi.mocked(await import('./default-template-fn.js'));

describe('monorepoPackagesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate a list of packages in the monorepo', async () => {
    const result = await monorepoPackagesList();
    expect(result).toBe('2 packages:\n\n- pkg-a\n\n- pkg-b');
    expect(readWorkspaces).toHaveBeenCalledTimes(1);
    expect(readWorkspaces).toHaveBeenCalledWith({ workingDir: cwd() });
    expect(defaultBeforeFn).toHaveBeenCalledTimes(1);
    expect(defaultBeforeFn).toHaveBeenCalledWith([
      { name: 'pkg-a', relativePath: 'packages/pkg-a' },
      { name: 'pkg-b', relativePath: 'packages/pkg-b' },
    ]);
    expect(defaultTemplateFn).toHaveBeenCalledTimes(2);
    expect(defaultTemplateFn).toHaveBeenNthCalledWith(1, { name: 'pkg-a', relativePath: 'packages/pkg-a' }, {});
    expect(defaultTemplateFn).toHaveBeenNthCalledWith(2, { name: 'pkg-b', relativePath: 'packages/pkg-b' }, {});
  });

  it('should use the specified delimiter', async () => {
    const result = await monorepoPackagesList({ delimiter: '\n' });
    expect(result).toBe('2 packages:\n\n- pkg-a\n- pkg-b');
  });

  it('should use the specified template function', async () => {
    const result = await monorepoPackagesList({ templateFn: workspace => `* ${workspace.name}` });
    expect(result).toBe('2 packages:\n\n* pkg-a\n\n* pkg-b');
  });

  it('should use the specified before string', async () => {
    const result = await monorepoPackagesList({ before: 'Packages:\n' });
    expect(result).toBe('Packages:\n- pkg-a\n\n- pkg-b');
  });

  it('should use the specified before function', async () => {
    const result = await monorepoPackagesList({ before: workspaces => `${workspaces.length} 📦\n\n` });
    expect(result).toBe('2 📦\n\n- pkg-a\n\n- pkg-b');
  });

  it('should use the specified after string', async () => {
    const result = await monorepoPackagesList({ after: '\n\n---' });
    expect(result).toBe('2 packages:\n\n- pkg-a\n\n- pkg-b\n\n---');
  });

  it('should use the specified after function', async () => {
    const result = await monorepoPackagesList({
      after: workspaces => `\n\n<small>${workspaces.length} packages</small>`,
    });
    expect(result).toBe('2 packages:\n\n- pkg-a\n\n- pkg-b\n\n<small>2 packages</small>');
  });

  it('should use the specified template data', async () => {
    const result = await monorepoPackagesList({
      templateFn: (workspace: WorkspaceMetadata, { custom }: TemplateData) =>
        `- ${workspace.name} (${custom as string})`,
      templateData: { custom: 'foo' },
    });
    expect(result).toBe('2 packages:\n\n- pkg-a (foo)\n\n- pkg-b (foo)');
  });

  it('should use the specified working directory', async () => {
    const result = await monorepoPackagesList({ workingDir: '/custom/dir' });
    expect(result).toBe('2 packages:\n\n- pkg-a\n\n- pkg-b');
    expect(readWorkspaces).toHaveBeenCalledTimes(1);
    expect(readWorkspaces).toHaveBeenCalledWith({ workingDir: '/custom/dir' });
  });

  it('should sort workspaces using the specified compare function', async () => {
    const result = await monorepoPackagesList({
      sortCompareFn: (a, b) => b.relativePath.localeCompare(a.relativePath),
    });
    expect(result).toBe('2 packages:\n\n- pkg-b\n\n- pkg-a');
  });

  it('should filter workspaces using the specified filter function', async () => {
    const result = await monorepoPackagesList({
      filterFn: workspace => workspace.name !== 'pkg-a',
    });
    expect(result).toBe('1 package:\n\n- pkg-b');
  });
});
