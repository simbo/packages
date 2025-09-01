import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./monorepo-packages-list-cli.js', () => ({
  monorepoPackagesListCli: vi.fn(),
}));

vi.mock('@simbo/clirk/clitch', () => ({
  clitch: vi.fn(),
}));

const { clitch } = vi.mocked(await import('@simbo/clirk/clitch'));
const { monorepoPackagesListCli: cliEntryPoint } = vi.mocked(await import('./monorepo-packages-list-cli.js'));

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('calls cli entry point', async () => {
    await import('./cli.js');
    expect(clitch).toHaveBeenCalledWith(cliEntryPoint);
  });
});
