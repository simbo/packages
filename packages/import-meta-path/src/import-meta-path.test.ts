import { beforeEach, describe, expect, it, vi } from 'vitest';

import { importMetaPath, type ImportMetaObject } from './import-meta-path.js';

vi.mock('node:path', async () => {
  const actual = await vi.importActual<typeof import('node:path')>('node:path');
  return {
    dirname: vi.fn().mockImplementation((path: string) => actual.dirname(path)),
  };
});

vi.mock('node:url', async () => {
  const actual = await vi.importActual<typeof import('node:url')>('node:url');
  return {
    fileURLToPath: vi.fn().mockImplementation((url: URL) => actual.fileURLToPath(url)),
  };
});

const { dirname } = vi.mocked(await import('node:path'));
// eslint-disable-next-line @typescript-eslint/naming-convention
const { fileURLToPath } = vi.mocked(await import('node:url'));

const defineImportMeta = (meta: Record<string, string>): ImportMetaObject => meta as unknown as ImportMetaObject;

describe('importMetaPath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the correct path for a directory from import.meta.dirname', () => {
    const meta = defineImportMeta({ dirname: '/dir' });
    const result = importMetaPath(meta);
    expect(result).toBe('/dir');
    expect(fileURLToPath).not.toHaveBeenCalled();
    expect(dirname).not.toHaveBeenCalled();
  });

  it('should return the correct path for a directory from import.meta.filename', () => {
    const meta = defineImportMeta({ filename: '/dir/file.js' });
    const result = importMetaPath(meta);
    expect(result).toBe('/dir');
    expect(fileURLToPath).not.toHaveBeenCalled();
    expect(dirname).toHaveBeenCalledTimes(1);
    expect(dirname).toHaveBeenCalledWith('/dir/file.js');
  });

  it('should return the correct path for a directory from import.meta.url', () => {
    const meta = defineImportMeta({ url: 'file:///dir/file.js' });
    const result = importMetaPath(meta);
    expect(result).toBe('/dir');
    expect(fileURLToPath).toHaveBeenCalledTimes(1);
    expect(fileURLToPath).toHaveBeenCalledWith('file:///dir/file.js');
    expect(dirname).toHaveBeenCalledTimes(1);
    expect(dirname).toHaveBeenCalledWith('/dir/file.js');
  });

  it('should return the correct path for a file from import.meta.filename', () => {
    const meta = defineImportMeta({ filename: '/dir/file.js' });
    const result = importMetaPath(meta, 'file');
    expect(result).toBe('/dir/file.js');
    expect(fileURLToPath).not.toHaveBeenCalled();
    expect(dirname).not.toHaveBeenCalled();
  });

  it('should return the correct path for a file from import.meta.url', () => {
    const meta = defineImportMeta({ url: 'file:///dir/file.js' });
    const result = importMetaPath(meta, 'file');
    expect(result).toBe('/dir/file.js');
    expect(fileURLToPath).toHaveBeenCalledTimes(1);
    expect(fileURLToPath).toHaveBeenCalledWith('file:///dir/file.js');
    expect(dirname).not.toHaveBeenCalled();
  });

  it('throws a clear error on unknown type (defensive default branch)', () => {
    const meta = defineImportMeta({});
    expect(() => importMetaPath(meta, 'weird' as string as 'dir')).toThrow(/^Unknown Type: weird/);
  });

  it('propagates errors from fileUrlToPath', () => {
    const meta = defineImportMeta({ url: 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==' });
    expect(() => importMetaPath(meta, 'file')).toThrow('URL must be of scheme file');
  });
});
