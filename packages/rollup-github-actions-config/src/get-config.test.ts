import type { Plugin } from 'rollup';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getConfig } from './get-config.js';

vi.mock('@rollup/plugin-terser', async () => ({
  default: vi.fn(() => ({ name: 'terser-plugin-mock' })),
}));

vi.mock('@rollup/plugin-typescript', async () => ({
  default: vi.fn(() => ({ name: 'typescript-plugin-mock' })),
}));

vi.mock('@rollup/plugin-node-resolve', async () => ({
  default: vi.fn(() => ({ name: 'resolve-plugin-mock' })),
}));

vi.mock('@rollup/plugin-commonjs', async () => ({
  default: vi.fn(() => ({ name: 'commonjs-plugin-mock' })),
}));

vi.mock('@rollup/plugin-json', async () => ({
  default: vi.fn(() => ({ name: 'json-plugin-mock' })),
}));

describe('getConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('suppresses known warning', async () => {
    const config = getConfig({
      knownWarnings: {
        MY_CODE: ['ignore this'],
      },
    });

    const onwarnSpy = vi.fn();
    const warning = {
      code: 'MY_CODE',
      message: 'This should be ignored: ignore this',
    };

    config.onwarn?.(warning, onwarnSpy);

    expect(onwarnSpy).not.toHaveBeenCalled(); // suppressed
  });

  it('passes unknown warning through', async () => {
    const config = getConfig({
      knownWarnings: {
        MY_CODE: ['some string'],
      },
    });

    const onwarnSpy = vi.fn();
    const warning = {
      code: 'OTHER_CODE',
      message: 'unexpected',
    };

    config.onwarn?.(warning, onwarnSpy);

    expect(onwarnSpy).toHaveBeenCalledWith(warning);
  });

  it('includes terser plugin when minify is true', () => {
    const config = getConfig({ minify: true });
    const pluginNames = (config.plugins as Plugin[]).map(p => p.name);

    expect(pluginNames).toContain('terser-plugin-mock');
  });

  it('excludes terser plugin when minify is false', () => {
    const config = getConfig({ minify: false });
    const pluginNames = (config.plugins as Plugin[]).map(p => p.name);

    expect(pluginNames).not.toContain('terser-plugin-mock');
  });
});
