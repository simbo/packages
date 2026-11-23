import { execFile } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const PKG_ROOT = dirname(import.meta.dirname);
const MOCKS_PATH = resolve(PKG_ROOT, 'mocks');
const ESLINT = resolve(PKG_ROOT, 'node_modules/.bin/eslint');

const execFileAsync = promisify(execFile);

/**
 * A test function to validate the ESLint configs during runtime.
 *
 * @param configName - The name of the config to test.
 * @returns A promise that resolves to the output of the ESLint command.
 */
async function testConfig(configName: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync(ESLINT, ['--config', `eslint-${configName}.config.ts`, 'file.ts'], {
      cwd: MOCKS_PATH,
    });
    return stdout.trim();
  } catch (error) {
    throw new Error(`ESLint failed for ${configName}: ${error as Error}`, { cause: error });
  }
}

describe(
  'eslint-config runtime test',
  {
    timeout: 30_000,
  },
  () => {
    it('should not fail on using configs.node.recommended', async () => {
      const result = await testConfig('node-recommended');
      expect(result).toBeDefined();
    });

    it('should not fail on using configs.browser.recommended', async () => {
      const result = await testConfig('browser-recommended');
      expect(result).toBeDefined();
    });
  },
);
