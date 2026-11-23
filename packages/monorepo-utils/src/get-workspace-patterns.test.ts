import type { Jsonifiable } from 'type-fest';
import { describe, expect, it, vi } from 'vitest';

import { getWorkspacePatterns } from './get-workspace-patterns.js';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    relative: vi.fn().mockImplementation((from: string, to: string) => actual.relative(from, to)),
    join: vi.fn().mockImplementation((...paths: string[]) => actual.join(...paths)),
  };
});

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('yaml', async () => {
  const actual = await vi.importActual<typeof import('yaml')>('yaml');
  return {
    parse: vi.fn().mockImplementation((data: string) => actual.parse(data) as Jsonifiable),
    stringify: actual.stringify,
  };
});

vi.mock('@simbo/accessible', () => ({
  isReadableFile: vi.fn().mockResolvedValue(true),
}));

const { readFile } = vi.mocked(await import('node:fs/promises'));
const { join, relative } = vi.mocked(await import('node:path'));
const { cwd } = vi.mocked(await import('node:process'));
const { isReadableFile } = vi.mocked(await import('@simbo/accessible'));
const { parse, stringify } = vi.mocked(await import('yaml'));

describe('getWorkspacePatterns', () => {
  it('should return an array of workspace patterns from pnpm-workspace.yaml', async () => {
    const yamlString = stringify({ packages: ['packages/*'] });
    readFile.mockResolvedValueOnce(yamlString);

    const patterns = await getWorkspacePatterns();

    expect(patterns).toEqual(['packages/*']);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).not.toHaveBeenCalled();
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml', 'utf8');
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(1, yamlString);
  });

  it('should return an array of workspace patterns from package.json', async () => {
    isReadableFile.mockResolvedValueOnce(false);
    readFile.mockResolvedValueOnce(JSON.stringify({ workspaces: ['packages/*'] }));

    const patterns = await getWorkspacePatterns();

    expect(patterns).toEqual(['packages/*']);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).not.toHaveBeenCalled();
    expect(join).toHaveBeenCalledTimes(2);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(join).toHaveBeenNthCalledWith(2, '/cwd', 'package.json');
    expect(isReadableFile).toHaveBeenCalledTimes(2);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenNthCalledWith(2, '/cwd/package.json');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/package.json', 'utf8');
    expect(parse).not.toHaveBeenCalled();
  });

  it('should take a custom working dir', async () => {
    const yamlString = stringify({ packages: ['packages/*'] });
    readFile.mockResolvedValueOnce(yamlString);
    const patterns = await getWorkspacePatterns({ workingDir: '/custom/dir' });

    expect(patterns).toEqual(['packages/*']);
    expect(cwd).not.toHaveBeenCalled();
    expect(relative).not.toHaveBeenCalled();
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/custom/dir', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/custom/dir/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/custom/dir/pnpm-workspace.yaml', 'utf8');
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(1, yamlString);
  });

  it('should throw if YAML parsing fails', async () => {
    const invalidYamlString = `}`;
    readFile.mockResolvedValueOnce(invalidYamlString);

    await expect(getWorkspacePatterns()).rejects.toThrow(/^Error reading pnpm-workspace.yaml: Unexpected /);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/pnpm-workspace.yaml');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml', 'utf8');
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(1, invalidYamlString);
  });

  it('should throw if JSON parsing fails', async () => {
    isReadableFile.mockResolvedValueOnce(false);
    readFile.mockResolvedValueOnce('}');

    await expect(getWorkspacePatterns()).rejects.toThrow(/^Error reading package.json: Unexpected /);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/package.json');
    expect(join).toHaveBeenCalledTimes(2);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(join).toHaveBeenNthCalledWith(2, '/cwd', 'package.json');
    expect(isReadableFile).toHaveBeenCalledTimes(2);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenNthCalledWith(2, '/cwd/package.json');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/package.json', 'utf8');
    expect(parse).not.toHaveBeenCalled();
  });

  it('should throw if readFile fails', async () => {
    readFile.mockRejectedValueOnce(new Error('readFile Failure'));

    await expect(getWorkspacePatterns()).rejects.toThrow(/^Error reading pnpm-workspace.yaml: readFile Failure/);
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/pnpm-workspace.yaml');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml', 'utf8');
    expect(parse).not.toHaveBeenCalled();
  });

  it('should throw if the configuration file provided empty patterns', async () => {
    const yamlString = stringify({ packages: [] });
    readFile.mockResolvedValueOnce(yamlString);

    await expect(getWorkspacePatterns()).rejects.toThrow('No workspace patterns found in pnpm-workspace.yaml');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/pnpm-workspace.yaml');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml', 'utf8');
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(1, yamlString);
  });

  it('should throw if the configuration file provided undefined patterns', async () => {
    const yamlString = stringify({});
    readFile.mockResolvedValueOnce(yamlString);

    await expect(getWorkspacePatterns()).rejects.toThrow('No workspace patterns found in pnpm-workspace.yaml');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/pnpm-workspace.yaml');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenCalledTimes(1);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml', 'utf8');
    expect(parse).toHaveBeenCalledTimes(1);
    expect(parse).toHaveBeenNthCalledWith(1, yamlString);
  });

  it('should throw when no configuration files where found', async () => {
    isReadableFile.mockResolvedValueOnce(false).mockResolvedValueOnce(false);

    await expect(getWorkspacePatterns()).rejects.toThrow('No configuration files found in /cwd');
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(relative).not.toHaveBeenCalled();
    expect(join).toHaveBeenCalledTimes(2);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd', 'pnpm-workspace.yaml');
    expect(join).toHaveBeenNthCalledWith(2, '/cwd', 'package.json');
    expect(isReadableFile).toHaveBeenCalledTimes(2);
    expect(isReadableFile).toHaveBeenNthCalledWith(1, '/cwd/pnpm-workspace.yaml');
    expect(isReadableFile).toHaveBeenNthCalledWith(2, '/cwd/package.json');
    expect(readFile).not.toHaveBeenCalled();
    expect(parse).not.toHaveBeenCalled();
  });
});
