import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';

import { afterEach, expect, test } from 'vitest';

import { prepareRelease } from './publish-release.js';

/**
 * @type {string[]}
 */
const directories = [];
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

/**
 * Replaces GitHub reads with a controlled release and a real local tar archive.
 * Calls are recorded to prove preparation never invokes a publish command.
 *
 * @param {Record<string, unknown>} [releaseOverrides] - Release fields to invalidate.
 * @param {Record<string, unknown>} [manifestOverrides] - Tagged manifest fields to invalidate.
 * @returns {{directory: string, calls: string[][], run: (command: string, args: string[]) => string}} Isolated runner fixture.
 */
function fixture(releaseOverrides, manifestOverrides) {
  const directory = mkdtempSync(join(tmpdir(), 'publish-release-'));
  directories.push(directory);
  const manifest = { name: '@simbo/different-name', version: '1.2.3', ...manifestOverrides };
  /**
   * @type {string[][]}
   */
  const calls = [];
  return {
    directory,
    calls,
    run(command, args) {
      calls.push([command, ...args]);
      expect(command).toBe('gh');
      if (args[0] === 'api' && args[1]?.includes('/releases/tags/')) {
        return JSON.stringify({ tag_name: 'example/v1.2.3', draft: false, prerelease: false, ...releaseOverrides });
      }
      if (args[0] === 'api' && args[1]?.includes('/contents/')) return JSON.stringify(manifest);
      expect(args.slice(0, 3)).toEqual(['release', 'download', 'example/v1.2.3']);
      mkdirSync(join(directory, 'package'));
      writeFileSync(join(directory, 'package/package.json'), JSON.stringify(manifest));
      execFileSync('tar', ['-czf', join(directory, 'example-1.2.3.tgz'), '-C', directory, 'package']);
      const digest = createHash('sha256')
        .update(readFileSync(join(directory, 'example-1.2.3.tgz')))
        .digest('hex');
      writeFileSync(join(directory, 'SHA256SUMS'), `${digest}  example-1.2.3.tgz\n`);
      return '';
    },
  };
}

test('prepares the tagged identity without consulting a local checkout or invoking pnpm', () => {
  const { directory, calls, run } = fixture();
  const metadata = prepareRelease('example/v1.2.3', directory, run);
  expect(metadata.name).toBe('@simbo/different-name');
  expect(calls.length).toBe(3);
  expect(calls[0]?.[2]?.endsWith('example%2Fv1.2.3')).toBeTruthy();
  expect(calls[1]?.[2]?.endsWith('?ref=example%2Fv1.2.3')).toBeTruthy();
  expect(calls.every(call => call[0] === 'gh')).toBeTruthy();
});

test('rejects drafts, prereleases and a response for another tag before downloading', () => {
  for (const release of [{ draft: true }, { prerelease: true }, { tag_name: 'other/v1.2.3' }]) {
    const { directory, calls, run } = fixture(release);
    expect(() => prepareRelease('example/v1.2.3', directory, run)).toThrow(/published stable/);
    expect(calls.length).toBe(1);
  }
});

test('rejects private manifests and mismatched source versions before downloading', () => {
  for (const manifest of [{ private: true }, { version: '9.0.0' }]) {
    const { directory, calls, run } = fixture(undefined, manifest);
    expect(() => prepareRelease('example/v1.2.3', directory, run)).toThrow(/Private packages|Version mismatch/);
    expect(calls.length).toBe(2);
  }
});

test('rejects a damaged download without ever invoking a registry command', () => {
  const { directory, calls, run } = fixture();
  expect(() =>
    prepareRelease('example/v1.2.3', directory, (command, args) => {
      const output = run(command, args);
      if (args[0] === 'release') writeFileSync(join(directory, 'example-1.2.3.tgz'), 'damaged');
      return output;
    }),
  ).toThrow(/Checksum mismatch/);
  expect(calls.every(call => call[0] === 'gh')).toBeTruthy();
});

test('non-interactive CLI refuses publishing before any network or registry operation', () => {
  const result = spawnSync(process.execPath, ['scripts/publish-release.js', 'example/v1.2.3'], {
    encoding: 'utf8',
  });
  expect(result.status).toBe(1);
  expect(result.stderr).toMatch(/requires an interactive terminal/);
});
