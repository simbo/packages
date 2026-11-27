import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { expect, test } from 'vitest';

import { createReleaseNotes } from './release-notes.js';

const execFileAsync = promisify(execFile);
const script = new URL('release-notes.js', import.meta.url);

/**
 * @type {{title: string, body: string, expected?: string, failure?: boolean}[]}
 */
const cases = [
  { title: 'surrounding whitespace', body: '\n \t\n### Changes\n\n- item\n\n \t\n', expected: '### Changes\n\n- item' },
  {
    title: 'Markdown indentation',
    body: '\n- item\n\n    code\n\n    more code\n\n',
    expected: '- item\n\n    code\n\n    more code',
  },
  { title: 'plain entry', body: '- item\n', expected: '- item' },
  { title: 'empty section', body: '\n \t\n', failure: true },
];

for (const scenario of cases) {
  test(`release notes preserve ${scenario.title}`, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'release-notes-'));
    try {
      await mkdir(join(directory, 'changelog'), { recursive: true });
      await writeFile(
        join(directory, 'changelog/CHANGELOG.md'),
        `# Example\n\n## 1.2.3\n${scenario.body}## 1.2.2\n\n- older entry\n`,
      );
      const result = execFileAsync(process.execPath, [script.pathname], {
        cwd: directory,
        encoding: 'utf8',
        env: {
          ...process.env,
          RELEASE_TAG: 'packages-changelog/v1.2.3',
          PACKAGE_DIR: 'changelog',
          RUNNER_TEMP: directory,
        },
      });
      if (scenario.failure) {
        await expect(result).rejects.toThrow(/Missing Release Notes/);
      } else {
        await result;
        const notes = await readFile(join(directory, 'package-release/RELEASE_NOTES.md'), 'utf8');
        const body = notes.slice(notes.indexOf('\n\n') + '\n\n'.length);
        expect(body).toBe(`${scenario.expected ?? ''}\n`);
        expect(body).not.toContain('older entry');
      }
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
}

test('release timestamps use Berlin winter and summer time', () => {
  const changelog = '## 1.2.3\n\n- item\n';
  expect(createReleaseNotes(changelog, '1.2.3', new Date('2026-01-01T23:05:06Z'))).toBe(
    '_2026-01-02 00:05:06 CET_\n\n- item\n',
  );
  expect(createReleaseNotes(changelog, '1.2.3', new Date('2026-07-01T22:05:06Z'))).toBe(
    '_2026-07-02 00:05:06 CEST_\n\n- item\n',
  );
});

test('missing version sections fail instead of selecting another release', () => {
  expect(() => createReleaseNotes('## 1.2.30\n\n- item\n', '1.2.3')).toThrow(/Missing Release Notes/);
});
