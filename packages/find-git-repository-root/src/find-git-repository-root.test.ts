import { describe, expect, it, vi, type Mock } from 'vitest';

import { findGitRepositoryRoot } from './find-git-repository-root.js';

vi.mock('@simbo/is-git-repository-root', () => ({
  isGitRepositoryRoot: vi.fn(),
}));

vi.mock('find-up', () => ({
  findUp: vi.fn(),
}));

vi.mock('node:process', () => ({
  cwd: vi.fn(() => '/mocked/cwd'),
}));

const { cwd } = vi.mocked(await import('node:process'));
const { findUp } = vi.mocked(await import('find-up')) as { findUp: Mock };
const { isGitRepositoryRoot } = vi.mocked(await import('@simbo/is-git-repository-root'));

describe('findGitRepositoryRoot', () => {
  it('resolves to the first directory where isGitRepositoryRoot returns true', async () => {
    // Simulate checking four levels, with the third being the Git root
    const callOrder: (string | undefined)[] = [];

    isGitRepositoryRoot.mockImplementation(async (dir?: string) => {
      callOrder.push(dir);
      return dir === '/repo';
    });

    findUp.mockImplementation(async (matcher: (dir: string) => Promise<string | undefined>) => {
      const paths = ['/repo/src/utils', '/repo/src', '/repo', '/'];
      for (const dir of paths) {
        const match = await matcher(dir);
        if (match) return match;
      }
      return;
    });

    const result = await findGitRepositoryRoot('/repo/src/utils');
    expect(result).toBe('/repo');
    expect(callOrder).toEqual(['/repo/src/utils', '/repo/src', '/repo']);
  });

  it('resolves to undefined if no git root is found', async () => {
    isGitRepositoryRoot.mockResolvedValue(false);

    findUp.mockImplementation(async (matcher: (dir: string) => Promise<string | undefined>) => {
      const paths = ['/notrepo/src/utils', '/notrepo/src', '/notrepo', '/'];
      for (const dir of paths) {
        const match = await matcher(dir);
        if (match) return match;
      }
      return;
    });

    const result = await findGitRepositoryRoot('/notrepo/src/utils');
    expect(result).toBeUndefined();
  });

  it('uses process.cwd() if no argument is passed', async () => {
    isGitRepositoryRoot.mockResolvedValue(true);
    cwd.mockReturnValue('/mockcwd');

    findUp.mockImplementation(async (matcher: (dir: string) => Promise<string | undefined>, opts: { cwd: string }) => {
      expect(opts.cwd).toBe('/mockcwd');
      return matcher('/mockcwd');
    });

    const result = await findGitRepositoryRoot();
    expect(result).toBe('/mockcwd');
  });
});
