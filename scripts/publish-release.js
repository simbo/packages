/**
 * Downloads and verifies a GitHub release package for an interactive local publish.
 *
 * Run through `pnpm run publish-initial -- <name>/v<version>`. Add --check
 * to download and verify only. No checkout, install, build or repack is performed.
 * Requires authenticated GitHub CLI, pnpm 12, Node.js and tar. The tag supplies
 * the expected identity, which the packed manifest must match; working-tree
 * versions are irrelevant. Private packages are verified but never published.
 * Downloaded archives remain in a temporary directory for inspection or recovery.
 */
import { execFile, spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';
import { promisify } from 'node:util';

import { isRecord, parseTag, verifyArchive } from './release-package.js';

const execFileAsync = promisify(execFile);

const REPOSITORY = 'simbo/packages';
const REGISTRY = 'https://registry.npmjs.org/';

/**
 * Executes read-only GitHub CLI operations without interpolating a shell command.
 * Authentication failures retain the CLI's diagnostic output.
 *
 * @param {string} command - Executable name.
 * @param {string[]} args - Separate arguments passed directly to the executable.
 * @returns {Promise<string>} Standard output for metadata parsing.
 */
async function commandOutput(command, args) {
  const child = execFileAsync(command, args, { encoding: 'utf8' });
  child.child.stderr?.pipe(process.stderr);
  const { stdout } = await child;
  return stdout;
}

/**
 * Runs an interactive command with inherited standard streams, so login and 2FA
 * prompts reach the terminal.
 *
 * @param {string} command - Executable name.
 * @param {string[]} args - Separate arguments passed directly to the executable.
 * @param {string} cwd - Working directory.
 * @returns {Promise<void>} Resolves when the command exits successfully.
 * @throws {Error} If the command cannot start or exits with another status.
 */
async function runInteractive(command, args, cwd) {
  // once() rejects when the child emits 'error', for example if the command is missing.
  /**
   * @type {unknown[]}
   */
  const exit = await once(spawn(command, args, { cwd, stdio: 'inherit' }), 'exit');
  if (exit[0] !== 0) throw new Error(`${command} exited with status ${String(exit[0])}.`);
}

/**
 * Obtains a published stable release and validates its exact package archive.
 * The command runner is injectable so tests can exercise failure paths without
 * network access or registry writes. This function never invokes pnpm publish.
 *
 * @param {string} tag - Stable package release tag.
 * @param {string} directory - Existing directory for downloaded release assets.
 * @param {(command: string, args: string[]) => Promise<string>} [run] - GitHub CLI runner.
 * @returns {Promise<import('./release-package.js').ReleaseTag & {private: boolean}>} Verified package identity.
 * @throws {Error} If the release, download, checksum or identity is invalid.
 */
export async function prepareRelease(tag, directory, run = commandOutput) {
  const metadata = parseTag(tag);
  /**
   * @type {unknown}
   */
  const release = JSON.parse(await run('gh', ['api', `repos/${REPOSITORY}/releases/tags/${encodeURIComponent(tag)}`]));
  if (!isRecord(release) || release.tag_name !== tag || release.draft !== false || release.prerelease !== false) {
    throw new Error(`Expected a published stable GitHub release for ${tag}.`);
  }
  await run('gh', [
    'release',
    'download',
    tag,
    '--repo',
    REPOSITORY,
    '--pattern',
    metadata.asset,
    '--pattern',
    'SHA256SUMS',
    '--dir',
    directory,
  ]);
  return { ...metadata, ...(await verifyArchive(metadata, directory)) };
}

/**
 * Presents the verified identity before allowing a local registry write.
 * Non-interactive invocations can only use --check; cancellation leaves the
 * downloaded files intact and performs no publish or automatic login.
 *
 * @returns {Promise<void>} Completes the requested check or confirmed publish.
 * @throws {Error} If arguments, tools, authentication or publication fail.
 */
async function main() {
  const args = process.argv.slice(2).filter(argument => argument !== '--');
  const checkOnly = args.includes('--check');
  const tags = args.filter(argument => argument !== '--check');
  if (tags.length !== 1 || !tags[0]) {
    throw new Error('Usage: pnpm run publish-initial -- [--check] <name>/v<version>');
  }
  const tag = tags[0];
  parseTag(tag);
  if (!checkOnly && !process.stdin.isTTY) {
    throw new Error('Publishing requires an interactive terminal. Use --check to verify without publishing.');
  }
  const directory = await mkdtemp(join(tmpdir(), 'verified-package-release-'));
  process.stdout.write(`📥 Checking ${tag} in ${directory}\n`);
  const metadata = await prepareRelease(tag, directory);
  process.stdout.write(
    `\n📦 Package: ${metadata.name}@${metadata.version}\n🏷️ Tag: ${tag}\n🔗 Registry: ${REGISTRY}\n📁 Archive: ${join(directory, metadata.asset)}\n`,
  );
  if (checkOnly) {
    process.stdout.write('✅ Check complete. Nothing published.\n');
    return;
  }
  if (metadata.private) {
    process.stdout.write('🔒 The package is private and is not published.\n');
    return;
  }
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  let answer;
  try {
    answer = await terminal.question('Publish this verified archive publicly? [y/N] ');
  } finally {
    terminal.close();
  }
  if (!/^y(?:es)?$/i.test(answer.trim())) {
    process.stdout.write('Publication cancelled. The verified archive is retained.\n');
    return;
  }
  await runInteractive(
    'pnpm',
    ['publish', join(directory, metadata.asset), '--access', 'public', '--registry', REGISTRY, '--no-git-checks'],
    directory,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`❌ ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
