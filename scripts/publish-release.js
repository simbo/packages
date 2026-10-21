/**
 * Downloads and verifies a GitHub release package for an interactive local publish.
 *
 * Run through `pnpm run publish-initial -- <workspace>/v<version>`. Add --check
 * to download and verify only. No checkout, install, build or repack is performed.
 * Requires authenticated GitHub CLI, pnpm 12, Node.js and tar. The tagged GitHub
 * manifest supplies the expected identity; working-tree versions are irrelevant.
 * Downloaded archives remain in a temporary directory for inspection or recovery.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { createInterface } from 'node:readline/promises';

import { isRecord, metadataFromManifest, parseTag, verifyArchive } from './release-package.js';

const REPOSITORY = 'simbo/packages';
const REGISTRY = 'https://registry.npmjs.org/';

/**
 * Executes read-only GitHub CLI operations without interpolating a shell command.
 * Authentication failures retain the CLI's diagnostic output.
 *
 * @param {string} command - Executable name.
 * @param {string[]} args - Separate arguments passed directly to the executable.
 * @returns {string} Standard output for metadata parsing.
 */
function commandOutput(command, args) {
  return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
}

/**
 * Obtains a published stable release and validates its exact package archive.
 * The command runner is injectable so tests can exercise failure paths without
 * network access or registry writes. This function never invokes pnpm publish.
 *
 * @param {string} tag - Stable package release tag.
 * @param {string} directory - Existing directory for downloaded release assets.
 * @param {(command: string, args: string[]) => string} [run] - GitHub CLI runner.
 * @returns {import('./release-package.js').ReleaseMetadata} Verified package identity.
 * @throws {Error} If the release, tagged manifest, download, checksum or identity is invalid.
 */
export function prepareRelease(tag, directory, run = commandOutput) {
  const parsed = parseTag(tag);
  const encodedTag = encodeURIComponent(tag);
  /**
   * @type {unknown}
   */
  const release = JSON.parse(run('gh', ['api', `repos/${REPOSITORY}/releases/tags/${encodedTag}`]));
  if (!isRecord(release) || release.tag_name !== tag || release.draft !== false || release.prerelease !== false) {
    throw new Error(`Expected a published stable GitHub release for ${tag}.`);
  }
  const source = run('gh', [
    'api',
    `repos/${REPOSITORY}/contents/packages/${parsed.workspace}/package.json?ref=${encodedTag}`,
    '--header',
    'Accept: application/vnd.github.raw+json',
  ]);
  const metadata = metadataFromManifest(tag, source);
  if (metadata.private) throw new Error('Private packages cannot be published.');
  run('gh', [
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
  verifyArchive(metadata, directory);
  return metadata;
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
    throw new Error('Usage: pnpm run publish-initial -- [--check] <workspace>/v<version>');
  }
  const tag = tags[0];
  parseTag(tag);
  if (!checkOnly && !process.stdin.isTTY) {
    throw new Error('Publishing requires an interactive terminal. Use --check to verify without publishing.');
  }
  const directory = mkdtempSync(join(tmpdir(), 'verified-package-release-'));
  process.stdout.write(`📥 Checking ${tag} in ${directory}\n`);
  const metadata = prepareRelease(tag, directory);
  process.stdout.write(
    `\n📦 Package: ${metadata.name}@${metadata.version}\n🏷️ Tag: ${tag}\n🔗 Registry: ${REGISTRY}\n📁 Archive: ${join(directory, metadata.asset)}\n`,
  );
  if (checkOnly) {
    process.stdout.write('✅ Check complete. Nothing published.\n');
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
  execFileSync(
    'pnpm',
    ['publish', join(directory, metadata.asset), '--access', 'public', '--registry', REGISTRY, '--no-git-checks'],
    { cwd: directory, stdio: 'inherit' },
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
