import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

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
      const result = spawnSync(
        process.execPath,
        [fileURLToPath(import.meta.resolve('cspell/bin')), '--config', 'cspell.json', '--no-progress', '**/*.md'],
        { cwd: directory, encoding: 'utf8' },
      );
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      const output = result.stdout + result.stderr;
      expect(output).toContain('CHANGELOG.md:2:3');
      expect(output).toContain('CHANGELOG.md:4:12');
      expect(output).toContain('CHANGELOG.md:5:8');
      expect(output).toContain('CHANGELOG.md:6:3');
      expect(output).toContain('README.md:1:3');
      expect(output).toContain('Issues found: 5');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
