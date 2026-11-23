/**
 * Validates the package identity shared by GitHub release and npm publish jobs.
 *
 * Run from the repository root after checking out the requested release tag:
 * `node scripts/release-package.js metadata <workspace>/v<version>`
 * writes scalar step outputs to GITHUB_OUTPUT. The `verify` command takes the
 * same tag followed by a directory containing the package archive and SHA256SUMS.
 * It verifies the existing bytes; it never builds, repacks, or publishes them.
 * Requires Node.js and the tar executable. Invalid inputs exit with status 1 and
 * a GitHub Actions error annotation; importing the module has no CLI side effects.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';

/**
 * Identity derived from a stable package tag, not from an npm package name.
 *
 * @typedef {object} ReleaseTag
 * @property {string} tag - Complete Git tag, such as example/v1.2.3.
 * @property {string} workspace - Folder directly below packages/.
 * @property {string} version - Stable major.minor.patch version.
 * @property {string} asset - Expected release asset basename, including .tgz.
 */

/**
 * Tag identity combined with the manifest in the checked-out repository.
 *
 * @typedef {ReleaseTag & {name: string, private: boolean}} ReleaseMetadata
 */

/**
 * Accepts JSON objects so manifest properties can be inspected without trusting
 * the untyped result of JSON.parse. Arrays and null are not manifests.
 *
 * @param {unknown} value - Parsed JSON value to inspect.
 * @returns {value is Record<string, unknown>} Whether the value is an object record.
 */
export function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Reads manifest JSON while retaining unknown property types until validated.
 * Both source manifests and packed manifests pass through the same object check.
 *
 * @param {string} source - JSON text from a manifest file or archive entry.
 * @returns {Record<string, unknown>} Parsed manifest whose property values still need validation.
 * @throws {Error} If JSON is malformed or the top-level value is not an object.
 */
function parseManifest(source) {
  /**
   * @type {unknown}
   */
  const manifest = JSON.parse(source);
  if (!isRecord(manifest)) throw new Error('Invalid package manifest: expected a JSON object.');
  return manifest;
}

/**
 * Parses the repository's stable release-tag convention before using its folder
 * or asset name in filesystem operations. Prereleases and the private changelog
 * workspace are excluded from this publication pipeline.
 *
 * @param {string} tag - Git tag in the form example/v1.2.3.
 * @returns {ReleaseTag} Validated workspace, version and archive basename.
 * @throws {Error} If the tag has an unsupported format or names changelog.
 */
export function parseTag(tag) {
  const match = /^([a-z0-9][a-z0-9._-]*)\/v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(tag);
  if (!match || match[1] === 'changelog') {
    throw new Error(
      `Invalid package tag: ${tag}. Expected <workspace>/v<major>.<minor>.<patch>; changelog is excluded.`,
    );
  }
  const [, workspace, version] = match;
  return { tag, workspace, version, asset: `${workspace}-${version}.tgz` };
}

/**
 * Resolves the npm name and private flag from the requested workspace manifest.
 * The caller must check out the tag first: a matching version alone does not
 * prove that arbitrary working-tree contents belong to that Git revision.
 * Private packages are reported for the workflow's explicit skip step.
 *
 * @param {string} tag - Stable package tag whose manifest must match.
 * @param {string} [root] - Checked-out repository root; defaults to the current directory.
 * @returns {ReleaseMetadata} Validated tag and source-manifest identity.
 * @throws {Error} If the manifest cannot be read, is invalid, or has a different version.
 */
export function readMetadata(tag, root = process.cwd()) {
  const metadata = parseTag(tag);
  const source = readFileSync(resolve(root, 'packages', metadata.workspace, 'package.json'), 'utf8');
  return metadataFromManifest(tag, source);
}

/**
 * Validates manifest text obtained from a tagged checkout or GitHub's tag API.
 * Keeping this check shared prevents local publishing from depending on the
 * version currently present in the user's working tree.
 *
 * @param {string} tag - Stable package tag whose version must match.
 * @param {string} source - Manifest JSON obtained from that Git revision.
 * @returns {ReleaseMetadata} Manifest identity combined with the parsed tag.
 * @throws {Error} If the manifest name or version is invalid.
 */
export function metadataFromManifest(tag, source) {
  const metadata = parseTag(tag);
  const manifest = parseManifest(source);
  if (typeof manifest.name !== 'string' || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*$/.test(manifest.name)) {
    throw new Error(`Invalid package name in packages/${metadata.workspace}/package.json.`);
  }
  if (manifest.version !== metadata.version) {
    throw new Error(
      `Version mismatch: tag requests ${metadata.version}, package declares ${String(manifest.version)}.`,
    );
  }
  return { ...metadata, name: manifest.name, private: manifest.private === true };
}

/**
 * Verifies an archive against the checked-out manifest and its downloaded digest.
 * SHA256SUMS must describe exactly the expected asset. The packed manifest must
 * match the source identity, be public, and contain no workspace protocol ranges.
 * Only package/package.json is read through tar; files are not extracted to disk.
 * A checksum detects changed bytes, not an attacker replacing both assets.
 *
 * @param {ReleaseMetadata} metadata - Identity read from the tagged checkout.
 * @param {string} directory - Directory containing the expected .tgz and SHA256SUMS.
 * @returns {void} Logs the verified identity and digest on success.
 * @throws {Error} If files or tar are unavailable, or any integrity or identity check fails.
 */
export function verifyArchive(metadata, directory) {
  const archive = resolve(directory, metadata.asset);
  const sums = readFileSync(resolve(directory, 'SHA256SUMS'), 'utf8').trimEnd();
  const digest = createHash('sha256').update(readFileSync(archive)).digest('hex');
  if (sums !== `${digest}  ${metadata.asset}`) {
    throw new Error(
      `Checksum mismatch: expected SHA256SUMS to identify exactly ${metadata.asset} and its SHA-256 digest.`,
    );
  }
  const manifest = parseManifest(execFileSync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' }));
  if (manifest.name !== metadata.name || manifest.version !== metadata.version) {
    throw new Error(
      `Archive identity mismatch: expected ${metadata.name}@${metadata.version}, found ${String(manifest.name)}@${String(manifest.version)}.`,
    );
  }
  if (manifest.private === true || metadata.private) {
    throw new Error('Private packages cannot be released or published by this workflow.');
  }
  for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies', 'devDependencies']) {
    const dependencies = manifest[field];
    if (
      isRecord(dependencies) &&
      Object.values(dependencies).some(value => typeof value === 'string' && value.startsWith('workspace:'))
    ) {
      throw new Error(`Unresolved workspace dependency in archive ${field}. Use pnpm pack from the tagged workspace.`);
    }
  }
  process.stdout.write(`✅ Verified ${metadata.name}@${metadata.version}: ${metadata.asset} (${digest})\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    const [command, tag, directory] = process.argv.slice(2);
    if (!tag || (command !== 'metadata' && command !== 'verify') || (command === 'verify' && !directory)) {
      throw new Error('Usage: node scripts/release-package.js <metadata|verify> <tag> [archive-directory]');
    }
    const metadata = readMetadata(tag);
    if (command === 'metadata') {
      if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required for workflow metadata.');
      for (const [key, value] of Object.entries(metadata)) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${String(value)}\n`);
      }
    } else if (directory) {
      verifyArchive(metadata, directory);
    }
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error))
      .replaceAll('%', '%25')
      .replaceAll('\r', '%0D')
      .replaceAll('\n', '%0A');
    process.stderr.write(`::error title=Package Release Validation Failed::${message}\n`);
    process.exitCode = 1;
  }
}
