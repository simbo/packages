import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { rollup, type RollupLog } from 'rollup';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getConfig } from './get-config.js';

let directory: string;

beforeEach(async () => {
  const temporaryDirectory = await mkdtemp(join(tmpdir(), 'rollup-github-actions-config-'));
  directory = await realpath(temporaryDirectory);
  // Lets the fixture resolve @simbo/tsconfig, @types/node and tslib like a real action.
  await symlink(join(import.meta.dirname, '..', 'node_modules'), join(directory, 'node_modules'), 'dir');
  await mkdir(join(directory, 'src'));
  await writeFile(join(directory, 'src', 'index.ts'), 'export const greeting: string = "hello";\n');
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

/**
 * Builds the fixture action with the configuration as an action would use it.
 *
 * @param compilerOptions - Compiler options of the fixture's tsconfig.build.json.
 * @returns The names of the generated files and all warnings that reach Rollup.
 */
async function buildFixture(
  compilerOptions: Record<string, unknown> = {},
): Promise<{ fileNames: string[]; code: string; warnings: RollupLog[] }> {
  const tsconfig = join(directory, 'tsconfig.build.json');
  await writeFile(
    tsconfig,
    JSON.stringify({
      extends: '@simbo/tsconfig/node',
      include: ['src'],
      compilerOptions: { rootDir: './src', outDir: './dist', ...compilerOptions },
    }),
  );

  const config = getConfig({ tsconfig, minify: false });
  const warnings: RollupLog[] = [];
  const bundle = await rollup({
    ...config,
    input: join(directory, 'src', 'index.ts'),
    onwarn: warning =>
      config.onwarn?.(warning, shown => {
        warnings.push(shown as RollupLog);
      }),
  });
  try {
    const outputOptions = Array.isArray(config.output) ? config.output[0] : config.output;
    const { output } = await bundle.generate({ ...outputOptions, dir: join(directory, 'dist') });
    return {
      fileNames: output.map(file => file.fileName),
      code: output[0].code,
      warnings,
    };
  } finally {
    await bundle.close();
  }
}

describe('getConfig build', () => {
  it('builds only the bundle although @simbo/tsconfig enables source maps and declarations', async () => {
    const { fileNames, code, warnings } = await buildFixture();

    expect(fileNames).toEqual(['index.js']);
    expect(code).not.toContain('sourceMappingURL');
    expect(warnings).toEqual([]);
  });

  it('also builds only the bundle when the tsconfig disables source maps and declarations itself', async () => {
    const { fileNames, warnings } = await buildFixture({
      declaration: false,
      sourceMap: false,
      inlineSources: false,
    });

    expect(fileNames).toEqual(['index.js']);
    expect(warnings).toEqual([]);
  });
});
