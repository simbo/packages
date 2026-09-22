import { describe, expect, it, vi } from 'vitest';

import { getWorkspaceMetadata } from './get-workspace-metadata.js';

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    basename: vi.fn().mockImplementation((path: string) => actual.basename(path)),
    relative: vi.fn().mockImplementation((from: string, to: string) => actual.relative(from, to)),
    resolve: vi.fn().mockImplementation((...args: string[]) => actual.resolve(...args)),
    join: vi.fn().mockImplementation((...args: string[]) => actual.join(...args)),
  };
});

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn().mockResolvedValue('# readme title\n\nreadme content'),
}));

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('@simbo/package-json', () => ({
  readPackageJson: vi.fn().mockResolvedValue({
    name: '@scope/test-package',
    description: 'A test package',
    version: '1.0.0',
  }),
}));

const { cwd } = vi.mocked(await import('node:process'));
const { basename, relative, resolve, join } = vi.mocked(await import('node:path'));
const { readPackageJson } = vi.mocked(await import('@simbo/package-json'));
const { readFile } = vi.mocked(await import('node:fs/promises'));

describe('getWorkspaceMetadata', () => {
  it("should return the package's metadata", async () => {
    const metadata = await getWorkspaceMetadata('packages/test-package');

    expect(metadata).toEqual({
      name: '@scope/test-package',
      version: '1.0.0',
      description: 'A test package',
      private: false,
      relativePath: 'packages/test-package',
      absolutePath: '/cwd/packages/test-package',
      folderName: 'test-package',
      packageJson: {
        name: '@scope/test-package',
        version: '1.0.0',
        description: 'A test package',
      },
      readme: '# readme title\n\nreadme content',
      title: 'readme title',
    });
    expect(cwd).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenNthCalledWith(1, '/cwd', 'packages/test-package');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/packages/test-package');
    expect(basename).toHaveBeenCalledTimes(1);
    expect(basename).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenCalledTimes(1);
    expect(readPackageJson).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package', 'README.md');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package/README.md', 'utf8');
  });

  it('should throw if required fields are missing', async () => {
    readPackageJson
      .mockResolvedValueOnce({
        name: '',
        description: 'A test package',
        version: '1.0.0',
      })
      .mockResolvedValueOnce({
        name: '@scope/test-package',
        version: '1.0.0',
      })
      .mockResolvedValueOnce({
        name: '@scope/test-package',
        description: 'A test package',
      });

    await expect(getWorkspaceMetadata('packages/test-package')).rejects.toThrow(
      'Invalid package.json at packages/test-package: name is required',
    );

    await expect(getWorkspaceMetadata('packages/test-package')).rejects.toThrow(
      'Invalid package.json at packages/test-package: description is required',
    );

    await expect(getWorkspaceMetadata('packages/test-package')).rejects.toThrow(
      'Invalid package.json at packages/test-package: version is required',
    );

    expect(cwd).toHaveBeenCalledTimes(3);
    expect(resolve).toHaveBeenCalledTimes(3);
    expect(resolve).toHaveBeenNthCalledWith(1, '/cwd', 'packages/test-package');
    expect(resolve).toHaveBeenNthCalledWith(2, '/cwd', 'packages/test-package');
    expect(resolve).toHaveBeenNthCalledWith(3, '/cwd', 'packages/test-package');
    expect(relative).toHaveBeenCalledTimes(3);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/packages/test-package');
    expect(relative).toHaveBeenNthCalledWith(2, '/cwd', '/cwd/packages/test-package');
    expect(relative).toHaveBeenNthCalledWith(3, '/cwd', '/cwd/packages/test-package');
    expect(basename).toHaveBeenCalledTimes(3);
    expect(basename).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(basename).toHaveBeenNthCalledWith(2, '/cwd/packages/test-package');
    expect(basename).toHaveBeenNthCalledWith(3, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenCalledTimes(3);
    expect(readPackageJson).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenNthCalledWith(2, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenNthCalledWith(3, '/cwd/packages/test-package');
    expect(join).not.toHaveBeenCalled();
    expect(readFile).not.toHaveBeenCalled();
  });

  it('should throw if the readme is not readable', async () => {
    readFile.mockRejectedValueOnce(new Error('readFile Failure'));

    await expect(getWorkspaceMetadata('packages/test-package')).rejects.toThrow(
      /^Failed to read README.md at packages\/test-package: readFile Failure$/,
    );

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenNthCalledWith(1, '/cwd', 'packages/test-package');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/packages/test-package');
    expect(basename).toHaveBeenCalledTimes(1);
    expect(basename).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenCalledTimes(1);
    expect(readPackageJson).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package', 'README.md');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package/README.md', 'utf8');
  });

  it("should throw if the readme's title is not found", async () => {
    readFile.mockResolvedValueOnce('foo');

    await expect(getWorkspaceMetadata('packages/test-package')).rejects.toThrow(
      /^Failed to extract the title from README.md at packages\/test-package\./,
    );

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(resolve).toHaveBeenNthCalledWith(1, '/cwd', 'packages/test-package');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenNthCalledWith(1, '/cwd', '/cwd/packages/test-package');
    expect(basename).toHaveBeenCalledTimes(1);
    expect(basename).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(readPackageJson).toHaveBeenCalledTimes(1);
    expect(readPackageJson).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package');
    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package', 'README.md');
    expect(readFile).toHaveBeenCalledTimes(1);
    expect(readFile).toHaveBeenNthCalledWith(1, '/cwd/packages/test-package/README.md', 'utf8');
  });
});
