/**
 * Validates the package identity shared by GitHub release and npm publish jobs.
 *
 * Run from the repository root after checking out the requested release tag:
 * `node scripts/release-package.js metadata <name>/v<version>` resolves the
 * workspace of the package and writes scalar step outputs to GITHUB_OUTPUT.
 * `parse` writes the identity derived from the tag alone and needs no installed
 * dependencies. The `verify` command takes the same tag followed by a directory
 * containing the package archive and SHA256SUMS. It verifies the existing bytes
 * and writes whether the packed manifest is private; it never builds, repacks,
 * or publishes them. Requires Node.js and the tar executable. Invalid inputs exit
 * with status 1 and a GitHub Actions error annotation; importing the module has
 * no CLI side effects.
 */
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Identity derived from a stable release tag.
 *
 * @typedef {object} ReleaseTag
 * @property {string} tag - Complete Git tag, such as `@simbo/example/v1.2.3`.
 * @property {string} name - Package name, including its scope.
 * @property {string} version - Stable major.minor.patch version.
 * @property {string} asset - Release asset basename as pnpm pack names it, including .tgz.
 */

/**
 * Tag identity combined with the manifest of the workspace in the checked-out repository.
 *
 * @typedef {ReleaseTag & {dir: string, private: boolean}} ReleaseMetadata
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
 * Names the archive of a package version the way `pnpm pack` does: the scope
 * loses its `@`, and its separator becomes a hyphen.
 *
 * @param {string} name - Package name, optionally scoped.
 * @param {string} version - Package version.
 * @returns {string} Archive basename, such as simbo-example-1.2.3.tgz.
 */
export function assetName(name, version) {
  return `${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`;
}

/**
 * Parses the repository's stable release-tag convention `<name>/v<version>`
 * before its parts are used in file names or API calls. The name is a package
 * name with an optional scope, so the tag contains one or two slashes.
 * Prereleases are excluded from this publication pipeline.
 *
 * @param {string} tag - Git tag in the form `@scope/name/v1.2.3` or `name/v1.2.3`.
 * @returns {ReleaseTag} Validated name, version and archive basename.
 * @throws {Error} If the tag has an unsupported format.
 */
export function parseTag(tag) {
  const match =
    /^((?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*)\/v((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))$/.exec(tag);
  if (!match) {
    throw new Error(`Invalid package tag: ${tag}. Expected <name>/v<major>.<minor>.<patch>.`);
  }
  const [, name, version] = match;
  return { tag, name, version, asset: assetName(name, version) };
}

/**
 * Validates manifest text of the tagged workspace against the tag.
 *
 * @param {string} tag - Stable package tag whose name and version must match.
 * @param {string} source - Manifest JSON obtained from that Git revision.
 * @returns {ReleaseTag & {private: boolean}} Tag identity and the manifest's private flag.
 * @throws {Error} If the manifest name or version differs from the tag.
 */
export function metadataFromManifest(tag, source) {
  const metadata = parseTag(tag);
  const manifest = parseManifest(source);
  if (manifest.name !== metadata.name) {
    throw new Error(`Name mismatch: tag requests ${metadata.name}, package declares ${String(manifest.name)}.`);
  }
  if (manifest.version !== metadata.version) {
    throw new Error(
      `Version mismatch: tag requests ${metadata.version}, package declares ${String(manifest.version)}.`,
    );
  }
  return { ...metadata, private: manifest.private === true };
}

/**
 * Resolves the workspace of the tagged package and validates its manifest.
 * The caller must check out the tag first: a matching version alone does not
 * prove that arbitrary working-tree contents belong to that Git revision.
 *
 * @param {string} tag - Stable package tag whose manifest must match.
 * @param {string} [root] - Checked-out repository root; defaults to the current directory.
 * @returns {Promise<ReleaseMetadata>} Validated tag identity, workspace directory and private flag.
 * @throws {Error} If no workspace declares the name, or its manifest is invalid or has another version.
 */
export async function readMetadata(tag, root = process.cwd()) {
  const { name } = parseTag(tag);
  // Imported on demand: the publish job runs `parse` and `verify` without installed dependencies.
  // A relative import, because a root dependency on a library would break the Turbo boundaries.
  const { getPackagePathByName } = await import('../packages/monorepo-utils/dist/index.js');
  const dir = await getPackagePathByName(name, { workingDir: root });
  const source = await readFile(join(root, dir, 'package.json'), 'utf8');
  return { ...metadataFromManifest(tag, source), dir };
}

/**
 * Verifies an archive against the tag identity and its downloaded digest.
 * SHA256SUMS must describe exactly the expected asset. The packed manifest must
 * match the tag and contain no workspace protocol ranges. Only
 * package/package.json is read through tar; files are not extracted to disk.
 * A checksum detects changed bytes, not an attacker replacing both assets.
 *
 * @param {ReleaseTag} metadata - Identity derived from the release tag.
 * @param {string} directory - Directory containing the expected .tgz and SHA256SUMS.
 * @returns {Promise<{private: boolean}>} Whether the packed manifest is private; publishing skips private packages.
 * @throws {Error} If files or tar are unavailable, or any integrity or identity check fails.
 */
export async function verifyArchive(metadata, directory) {
  const archive = resolve(directory, metadata.asset);
  const [sums, bytes] = await Promise.all([readFile(resolve(directory, 'SHA256SUMS'), 'utf8'), readFile(archive)]);
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (sums.trimEnd() !== `${digest}  ${metadata.asset}`) {
    throw new Error(
      `Checksum mismatch: expected SHA256SUMS to identify exactly ${metadata.asset} and its SHA-256 digest.`,
    );
  }
  const { stdout } = await execFileAsync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' });
  const manifest = parseManifest(stdout);
  if (manifest.name !== metadata.name || manifest.version !== metadata.version) {
    throw new Error(
      `Archive identity mismatch: expected ${metadata.name}@${metadata.version}, found ${String(manifest.name)}@${String(manifest.version)}.`,
    );
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
  const isPrivate = manifest.private === true;
  process.stdout.write(
    `✅ Verified ${metadata.name}@${metadata.version}${isPrivate ? ' (private)' : ''}: ${metadata.asset} (${digest})\n`,
  );
  return { private: isPrivate };
}

/**
 * Appends scalar values to the GitHub Actions step outputs.
 *
 * @param {Record<string, string | boolean>} values - Output names and values.
 * @returns {Promise<void>} Resolves once the outputs are written.
 * @throws {Error} If GITHUB_OUTPUT is not set.
 */
async function writeOutputs(values) {
  if (!process.env.GITHUB_OUTPUT) throw new Error('GITHUB_OUTPUT is required for workflow metadata.');
  const lines = Object.entries(values).map(([key, value]) => `${key}=${String(value)}\n`);
  await appendFile(process.env.GITHUB_OUTPUT, lines.join(''));
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    const [command, tag, directory] = process.argv.slice(2);
    if (!tag || !['metadata', 'parse', 'verify'].includes(command) || (command === 'verify' && !directory)) {
      throw new Error('Usage: node scripts/release-package.js <metadata|parse|verify> <tag> [archive-directory]');
    }
    if (command === 'metadata') {
      await writeOutputs(await readMetadata(tag));
    } else if (command === 'parse') {
      await writeOutputs(parseTag(tag));
    } else if (directory) {
      const result = await verifyArchive(parseTag(tag), directory);
      if (process.env.GITHUB_OUTPUT) await writeOutputs(result);
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
