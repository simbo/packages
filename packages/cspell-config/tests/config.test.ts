import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const pkg = await import('../src/index.js');

describe('CSpell Configuration Package', () => {
  it('provides a cspell config as default export', () => {
    expect(pkg.default).toBeDefined();
    expect(pkg.default.files).toBeDefined();
    expect(pkg.default.dictionaries).toBeDefined();
  });

  it('has no other exports', () => {
    const keys = Object.keys(pkg);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe('default');
  });
});

describe('Changelog commit hashes', () => {
  // Spawns a real CSpell CLI process, which starts slowly under high system load.
  it('ignores hash prefixes only in changelogs while still checking descriptions and prose', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cspell-config-'));
    try {
      const settings = {
        ...pkg.default,
        dictionaryDefinitions: pkg.default.dictionaryDefinitions?.map(dictionary => ({
          ...dictionary,
          path: resolve(import.meta.dirname, '../src', dictionary.path ?? ''),
        })),
      };
      await writeFile(join(directory, 'cspell.json'), JSON.stringify(settings));
      await mkdir(join(directory, 'nested'));
      await writeFile(
        join(directory, 'nested/CHANGELOG.md'),
        [
          '- cebccff: Fix spelling.',
          '- cebccfff: Fix spelling.',
          '- CEbccFF: Fix spelling.',
          '- cebccff: cebccff',
          'Commit cebccff appears in prose.',
          '- cebccf: Fix spelling.',
        ].join('\n'),
      );
      await writeFile(join(directory, 'README.md'), '- cebccff: Fix spelling.');
      const result: unknown = await execFileAsync(
        process.execPath,
        [fileURLToPath(import.meta.resolve('cspell/bin')), '--config', 'cspell.json', '--no-progress', '**/*.md'],
        { cwd: directory, encoding: 'utf8' },
      ).catch((error: unknown) => error);
      expect(result).toMatchObject({ code: 1 });
      const { stdout, stderr } = result as { stdout: string; stderr: string };
      const output = stdout + stderr;
      expect(output).toContain('CHANGELOG.md:2:3');
      expect(output).toContain('CHANGELOG.md:4:12');
      expect(output).toContain('CHANGELOG.md:5:8');
      expect(output).toContain('CHANGELOG.md:6:3');
      expect(output).toContain('README.md:1:3');
      expect(output).toContain('Issues found: 5');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }, 30_000);
});
