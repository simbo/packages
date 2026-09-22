import { describe, expect, it, vi, type Mock } from 'vitest';

import { findUpPackage } from './find-up-package.js';

vi.mock('@simbo/package-json', () => ({
  readPackageJson: vi.fn(),
}));

vi.mock('find-up', () => ({
  findUp: vi.fn(),
}));

vi.mock('normalize-package-data', () => ({
  default: vi.fn(),
}));

const { readPackageJson } = vi.mocked(await import('@simbo/package-json'));
const { findUp } = vi.mocked(await import('find-up')) as { findUp: Mock };
const { default: normalizePackageData } = vi.mocked(await import('normalize-package-data')) as { default: Mock };

type MatcherReturn = string | undefined | Promise<string | undefined>;
type Matcher = (directory: string) => MatcherReturn;

describe('findUpPackage', () => {
  it('returns the matched package', async () => {
    readPackageJson.mockResolvedValueOnce({ name: 'test', version: '1.0.0' });
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/fake/path'));

    const result = await findUpPackage({ workingDir: '/fake' });

    expect(result).toEqual({
      path: '/fake/path',
      packageJson: { name: 'test', version: '1.0.0' },
    });
  });

  it('returns normalized package when normalize is true', async () => {
    const pkg = { name: 'pkg', version: '0.1.0' };
    readPackageJson.mockResolvedValueOnce(pkg);
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/norm/path'));
    normalizePackageData.mockImplementationOnce((_data, warn: (str?: string) => void, _strict) => {
      warn();
    });

    const result = await findUpPackage({ workingDir: '/norm', normalize: true });

    expect(normalizePackageData).toHaveBeenCalledWith(pkg, expect.any(Function), false);
    expect(result).toEqual({
      path: '/norm/path',
      packageJson: pkg,
    });
  });

  it('returns undefined if matchFn returns false', async () => {
    readPackageJson.mockResolvedValueOnce({ name: 'nope', version: '0.0.0' });
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/some/path'));

    const result = await findUpPackage({
      matchFn: () => false,
      workingDir: '/some',
    });

    expect(result).toBeUndefined();
  });

  it('returns undefined if readPackageJson throws', async () => {
    readPackageJson.mockRejectedValueOnce(new Error('fail'));
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/broken/path'));

    const result = await findUpPackage({ workingDir: '/broken' });

    expect(result).toBeUndefined();
  });

  it('returns undefined if findUp yields no match', async () => {
    findUp.mockResolvedValueOnce(undefined);

    const result = await findUpPackage({ workingDir: '/nowhere' });

    expect(result).toBeUndefined();
  });

  it('supports async matchFn returning Promise<boolean>', async () => {
    readPackageJson.mockResolvedValueOnce({ name: 'async-pkg', version: '0.0.1' });
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/async/path'));

    const result = await findUpPackage({
      workingDir: '/async',
      matchFn: async () => true,
    });

    expect(result).toEqual({
      path: '/async/path',
      packageJson: { name: 'async-pkg', version: '0.0.1' },
    });
  });

  it('supports normalize config with warn and strict', async () => {
    const pkg = { name: 'conf-pkg', version: '9.9.9' };
    const warn = vi.fn();
    readPackageJson.mockResolvedValueOnce(pkg);
    findUp.mockImplementationOnce((matcher: Matcher): MatcherReturn => matcher('/config/path'));
    normalizePackageData.mockImplementationOnce((_data, warnFn: (str?: string) => void, _strict) => {
      warnFn();
    });

    const result = await findUpPackage({
      workingDir: '/config',
      normalize: { warn, strict: true },
    });

    expect(normalizePackageData).toHaveBeenCalledWith(pkg, warn, true);
    expect(warn).toHaveBeenCalled();
    expect(result).toEqual({
      path: '/config/path',
      packageJson: pkg,
    });
  });
});
