import type { ClirkContext } from '@simbo/clirk';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import 'node:test';

import { CLI_CONFIG } from './cli-config.js';

vi.mock('node:console', () => ({
  log: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('file content'),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    relative: vi.fn().mockImplementation((from: string, to: string) => actual.relative(from, to)),
    resolve: vi.fn().mockImplementation((...paths: string[]) => actual.resolve(...paths)),
  };
});

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('@simbo/accessible', () => ({
  isWritableFile: vi.fn().mockResolvedValue(true),
}));

vi.mock('@simbo/call-prettier', () => ({
  callPrettier: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@simbo/cli-output', () => ({
  success: vi.fn().mockImplementation((msg: string) => `[success] ${msg}`),
}));

vi.mock('@simbo/clirk', () => ({
  clirk: vi.fn().mockResolvedValue({ args: { _: [] } }),
}));

vi.mock('@simbo/find-git-repository-root', () => ({
  findGitRepositoryRoot: vi.fn().mockResolvedValue('/monorepo'),
}));

vi.mock('@simbo/inject-between-html-comments', () => ({
  injectBetweenHtmlComments: vi.fn().mockReturnValue('updated content'),
}));

vi.mock('@simbo/monorepo-packages-list', () => ({
  monorepoPackagesList: vi.fn().mockResolvedValue('packages list'),
}));

vi.mock('yoctocolors', () => ({
  dim: vi.fn().mockImplementation((str: string) => `[d]${str}[/d]`),
}));

vi.mock('./config-loader.js', () => ({
  createConfigLoader: vi
    .fn()
    .mockReturnValue(vi.fn().mockResolvedValue([{ someConfig: true, targetFile: 'README.md' }])),
}));

const { log } = vi.mocked(await import('node:console'));
const { readFile, writeFile } = vi.mocked(await import('node:fs/promises'));
const { relative, resolve } = vi.mocked(await import('node:path'));
const { cwd } = vi.mocked(await import('node:process'));
const { isWritableFile } = vi.mocked(await import('@simbo/accessible'));
const { callPrettier } = vi.mocked(await import('@simbo/call-prettier'));
const { clirk } = vi.mocked(await import('@simbo/clirk'));
const { findGitRepositoryRoot } = vi.mocked(await import('@simbo/find-git-repository-root'));
const { injectBetweenHtmlComments } = vi.mocked(await import('@simbo/inject-between-html-comments'));
const { monorepoPackagesList } = vi.mocked(await import('@simbo/monorepo-packages-list'));
const { createConfigLoader } = vi.mocked(await import('./config-loader.js'));

const { monorepoPackagesListCli } = await import('./monorepo-packages-list-cli.js');

describe('monorepoPackagesListCli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks the happy path', async () => {
    await monorepoPackagesListCli();

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(clirk).toHaveBeenCalledTimes(1);
    expect(clirk).toHaveBeenCalledWith(CLI_CONFIG);
    expect(findGitRepositoryRoot).toHaveBeenCalledTimes(1);
    expect(findGitRepositoryRoot).toHaveBeenCalledWith('/cwd');
    expect(createConfigLoader).toHaveBeenCalledTimes(1);
    expect(createConfigLoader).toHaveBeenCalledWith('/monorepo');
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith('/monorepo', 'README.md');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledWith('/monorepo', '/monorepo/README.md');
    expect(isWritableFile).toHaveBeenCalledTimes(1);
    expect(isWritableFile).toHaveBeenCalledWith('/monorepo/README.md');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/monorepo/README.md', 'utf8');
    expect(monorepoPackagesList).toHaveBeenCalledTimes(1);
    expect(monorepoPackagesList).toHaveBeenCalledWith({ someConfig: true, workingDir: '/monorepo' });
    expect(injectBetweenHtmlComments).toHaveBeenCalledTimes(1);
    expect(injectBetweenHtmlComments).toHaveBeenCalledWith('file content', 'packages list', { text: 'PACKAGES' });
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith('/monorepo/README.md', 'updated content', 'utf8');
    expect(callPrettier).toHaveBeenCalledTimes(1);
    expect(callPrettier).toHaveBeenCalledWith('README.md', { workingDir: '/monorepo' });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[success] Monorepo packages list updated. [d](README.md)[/d]');
  });

  it('accepts a custom target file', async () => {
    clirk.mockResolvedValueOnce({ args: { _: ['path/CUSTOM.md'] } } as unknown as ClirkContext);
    await monorepoPackagesListCli();
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledWith('/monorepo', 'path/CUSTOM.md');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledWith('/monorepo', '/monorepo/path/CUSTOM.md');
    expect(isWritableFile).toHaveBeenCalledTimes(1);
    expect(isWritableFile).toHaveBeenCalledWith('/monorepo/path/CUSTOM.md');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenCalledWith('/monorepo/path/CUSTOM.md', 'utf8');
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith('/monorepo/path/CUSTOM.md', 'updated content', 'utf8');
    expect(callPrettier).toHaveBeenCalledTimes(1);
    expect(callPrettier).toHaveBeenCalledWith('path/CUSTOM.md', { workingDir: '/monorepo' });
    expect(log).toHaveBeenCalledTimes(1);
    expect(log).toHaveBeenCalledWith('[success] Monorepo packages list updated. [d](path/CUSTOM.md)[/d]');
  });

  it('throws if the target file is not writable', async () => {
    isWritableFile.mockResolvedValueOnce(false);
    await expect(monorepoPackagesListCli()).rejects.toThrow(`File is not writable: README.md`);
  });

  it('throws if the monorepo root could not be found', async () => {
    findGitRepositoryRoot.mockResolvedValueOnce(undefined);
    await expect(monorepoPackagesListCli()).rejects.toThrow(`Monorepo root not found starting from: /cwd`);
  });
});
