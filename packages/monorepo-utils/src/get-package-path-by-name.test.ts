import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:path', async importActual => {
  const actual = await importActual<{ relative: (from: string, to: string) => string }>();
  return {
    ...actual,
    relative: vi.fn().mockImplementation(actual.relative),
  };
});

vi.mock('node:process', () => ({
  cwd: vi.fn().mockReturnValue('/cwd'),
}));

vi.mock('@simbo/package-json', () => ({
  readPackageJson: vi.fn(),
}));

vi.mock('@simbo/stringify-error', () => ({
  stringifyError: vi.fn().mockImplementation((error: Error) => error.message),
}));

vi.mock('./get-workspace-paths.js', () => ({
  getWorkspacePaths: vi.fn(),
}));

const { relative } = vi.mocked(await import('node:path'));
const { cwd } = vi.mocked(await import('node:process'));
const { readPackageJson } = vi.mocked(await import('@simbo/package-json'));
const { getWorkspacePaths } = vi.mocked(await import('./get-workspace-paths.js'));

const { getPackagePathByName } = await import('./get-package-path-by-name.js');

describe('getPackagePathByName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should walk the happy path and return the package path', async () => {
    getWorkspacePaths.mockResolvedValue(['/cwd/packages/pkg-a']);
    readPackageJson.mockResolvedValueOnce({ name: 'pkg-a', version: '1.0.0' });

    await expect(getPackagePathByName('pkg-a')).resolves.toBe('packages/pkg-a');

    expect(cwd).toHaveBeenCalledTimes(1);
    expect(cwd).toHaveBeenCalledWith();
    expect(getWorkspacePaths).toHaveBeenCalledTimes(1);
    expect(getWorkspacePaths).toHaveBeenCalledWith({ workingDir: '/cwd', absolutePaths: true });
    expect(readPackageJson).toHaveBeenCalledTimes(1);
    expect(readPackageJson).toHaveBeenNthCalledWith(1, '/cwd/packages/pkg-a');
    expect(relative).toHaveBeenCalledTimes(1);
    expect(relative).toHaveBeenCalledWith('/cwd', '/cwd/packages/pkg-a');
  });

  it('should return the absolute path of the package when found and absolute is true', async () => {
    getWorkspacePaths.mockResolvedValue(['/cwd/packages/pkg-a']);
    readPackageJson.mockResolvedValueOnce({ name: 'pkg-a', version: '1.0.0' });

    await expect(getPackagePathByName('pkg-a', { absolute: true })).resolves.toBe('/cwd/packages/pkg-a');
    expect(relative).not.toHaveBeenCalled();
  });

  it('should throw an error when the package is not found', async () => {
    getWorkspacePaths.mockResolvedValue(['/cwd/packages/pkg-a']);
    readPackageJson.mockResolvedValueOnce({ name: 'pkg-a', version: '1.0.0' });

    await expect(getPackagePathByName('pkg-b')).rejects.toThrowError('Package "pkg-b" not found in workspaces.');
  });

  it('should throw an error when reading package.json fails and failOnError is true', async () => {
    getWorkspacePaths.mockResolvedValue(['/cwd/packages/pkg-a']);
    readPackageJson.mockRejectedValueOnce(new Error('Failed to read package.json'));

    await expect(getPackagePathByName('pkg-b', { failOnError: true })).rejects.toThrowError(
      'Failed to read package.json files: packages/pkg-a (Failed to read package.json)',
    );
  });

  it('should continue on error when reading package.json fails and failOnError is false', async () => {
    getWorkspacePaths.mockResolvedValue(['/cwd/packages/pkg-a', '/cwd/packages/pkg-b']);
    readPackageJson
      .mockRejectedValueOnce(new Error('Failed to read package.json'))
      .mockResolvedValueOnce({ name: 'pkg-b', version: '1.0.0' });

    await expect(getPackagePathByName('pkg-b')).resolves.toBe('packages/pkg-b');
  });
});
