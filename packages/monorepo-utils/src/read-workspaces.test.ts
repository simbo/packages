import { beforeEach, describe, expect, it, vi } from 'vitest';

import { readWorkspaces } from './read-workspaces.js';

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
  env: {},
}));

vi.mock('p-queue', async () => {
  const actual = await vi.importActual<typeof import('p-queue')>('p-queue');
  const queueOpts: { concurrency?: number } = {};
  return {
    queueOptions: queueOpts,
    default: class extends actual.default {
      public constructor(options: { concurrency: number }) {
        super(options);
        queueOpts.concurrency = options.concurrency;
      }
    },
  };
});

vi.mock('./get-workspace-metadata.js', () => ({
  getWorkspaceMetadata: vi.fn().mockResolvedValue({ name: 'mock' }),
}));

vi.mock('./get-workspace-paths.js', () => ({
  getWorkspacePaths: vi.fn().mockResolvedValue(['packages/pkg-a', 'packages/pkg-b']),
}));

const { cwd, env } = vi.mocked(await import('node:process'));
const { getWorkspaceMetadata } = vi.mocked(await import('./get-workspace-metadata.js'));
const { getWorkspacePaths } = vi.mocked(await import('./get-workspace-paths.js'));
const { queueOptions } = vi.mocked(await import('p-queue')) as unknown as { queueOptions: { concurrency?: number } };

describe('readWorkspaces', () => {
  beforeEach(() => {
    delete env.CI;
  });

  it('should provide workspace metadata', async () => {
    const workspaces = await readWorkspaces();

    expect(workspaces).toEqual([{ name: 'mock' }, { name: 'mock' }]);
    expect(queueOptions.concurrency).toBe(10);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenNthCalledWith(1, { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(1, 'packages/pkg-a', { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(2, 'packages/pkg-b', { workingDir: '/cwd' });
  });

  it('should use different concurrency value in CI environments', async () => {
    env.CI = 'true';
    const workspaces = await readWorkspaces();

    expect(workspaces).toEqual([{ name: 'mock' }, { name: 'mock' }]);
    expect(queueOptions.concurrency).toBe(5);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenNthCalledWith(1, { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(1, 'packages/pkg-a', { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(2, 'packages/pkg-b', { workingDir: '/cwd' });
  });

  it('should use the specified concurrency', async () => {
    const workspaces = await readWorkspaces({ concurrency: 3 });

    expect(workspaces).toEqual([{ name: 'mock' }, { name: 'mock' }]);
    expect(queueOptions.concurrency).toBe(3);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenNthCalledWith(1, { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(1, 'packages/pkg-a', { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(2, 'packages/pkg-b', { workingDir: '/cwd' });
  });

  it('should use the specified concurrency even in CI environments', async () => {
    env.CI = 'true';
    const workspaces = await readWorkspaces({ concurrency: 3 });

    expect(workspaces).toEqual([{ name: 'mock' }, { name: 'mock' }]);
    expect(queueOptions.concurrency).toBe(3);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenNthCalledWith(1, { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(1, 'packages/pkg-a', { workingDir: '/cwd' });
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(2, 'packages/pkg-b', { workingDir: '/cwd' });
  });

  it('should use the specified working directory', async () => {
    const workspaces = await readWorkspaces({ workingDir: '/custom/dir' });

    expect(workspaces).toEqual([{ name: 'mock' }, { name: 'mock' }]);
    expect(cwd).not.toHaveBeenCalled();
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenNthCalledWith(1, { workingDir: '/custom/dir' });
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(1, 'packages/pkg-a', { workingDir: '/custom/dir' });
    expect(getWorkspaceMetadata).toHaveBeenNthCalledWith(2, 'packages/pkg-b', { workingDir: '/custom/dir' });
  });

  it('should throw if concurrency is not a number', async () => {
    await expect(readWorkspaces({ concurrency: 'invalid' as unknown as number })).rejects.toThrow(
      'Concurrency must be a positive number',
    );

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).not.toHaveBeenCalled();
    expect(getWorkspaceMetadata).not.toHaveBeenCalled();
  });

  it('should throw if concurrency is not a positive number', async () => {
    await expect(readWorkspaces({ concurrency: 0 })).rejects.toThrow('Concurrency must be a positive number');

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).not.toHaveBeenCalled();
    expect(getWorkspaceMetadata).not.toHaveBeenCalled();
  });

  it('should throw if a workspace failed to be read', async () => {
    getWorkspaceMetadata.mockRejectedValueOnce(new Error('metadata failure'));

    await expect(readWorkspaces()).rejects.toThrow(/^Failed to read workspace: packages\/pkg-a \(metadata failure\)$/);

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
  });

  it('should throw if multiple workspaces failed to be read', async () => {
    getWorkspaceMetadata.mockRejectedValueOnce(new Error('metadata failure'));
    getWorkspaceMetadata.mockRejectedValueOnce(new Error('metadata failure'));

    await expect(readWorkspaces()).rejects.toThrow(
      /^Failed to read workspaces: packages\/pkg-a \(metadata failure\), packages\/pkg-b \(metadata failure\)$/,
    );

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspaceMetadata).toHaveBeenCalledTimes(2);
  });
});
