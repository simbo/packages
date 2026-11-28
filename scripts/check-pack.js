/**
 * Checks that a workspace packs into an archive its users can install.
 *
 * Run from a package directory after its build: `node ../../scripts/check-pack.js`
 * packs the workspace with `pnpm pack` into a temporary directory, like the
 * release does, and checks the archive: the packed manifest has the name and
 * version of the workspace and no workspace protocol ranges, and every file
 * that `exports`, `main`, `types` and `bin` name is in the archive, including
 * the declaration file of every JavaScript entry point if the archive ships
 * declarations. Private workspaces are skipped. Requires pnpm and the tar
 * executable. A failed check exits with status 1; importing the module has no
 * CLI side effects.
 */
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, posix, resolve } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';

import { assertNoWorkspaceRanges, isRecord, parseManifest } from './release-package.js';

const execFileAsync = promisify(execFile);

/**
 * Collects the string leaves of an `exports` value, including conditions and
 * fallback arrays. `null` excludes a subpath and names no file.
 *
 * @param {unknown} value - The `exports` field or one of its nested values.
 * @returns {string[]} Every path the value names.
 */
function exportPaths(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(item => exportPaths(item));
  if (isRecord(value)) return Object.values(value).flatMap(item => exportPaths(item));
  return [];
}

/**
 * Normalizes a manifest path to the form `pnpm pack` lists archive files in.
 *
 * @param {string} path - Path from a manifest, such as `./dist/index.js`.
 * @returns {string} Path relative to the package root, such as `dist/index.js`.
 */
function normalizePath(path) {
  return posix.normalize(path).replace(/^\.\//, '');
}

/**
 * Lists the files a manifest promises to its users.
 *
 * @param {Record<string, unknown>} manifest - Package manifest.
 * @returns {{entries: string[], bins: string[]}} Normalized paths of the
 *   module entry points (`exports`, `main`, `types`, `typings`) and of the
 *   executables (`bin`).
 */
export function manifestTargets(manifest) {
  const entries = [
    ...exportPaths(manifest.exports),
    ...['main', 'types', 'typings'].map(field => manifest[field]).filter(value => typeof value === 'string'),
  ];
  const bins =
    typeof manifest.bin === 'string'
      ? [manifest.bin]
      : isRecord(manifest.bin)
        ? Object.values(manifest.bin).filter(value => typeof value === 'string')
        : [];
  return {
    entries: [...new Set(entries.map(path => normalizePath(path)))],
    bins: [...new Set(bins.map(path => normalizePath(path)))],
  };
}

/**
 * Turns an `exports` subpath pattern into a regular expression for archive paths.
 *
 * @param {string} pattern - Normalized path containing `*`.
 * @returns {RegExp} Expression that matches the archive paths the pattern covers.
 */
function patternExpression(pattern) {
  const source = pattern
    .split('*')
    .map(part => part.replaceAll(/[$()+.?[\\\]^{|}]/g, String.raw`\$&`))
    .join('.+');
  return new RegExp(`^${source}$`);
}

/**
 * Compares the files a manifest promises with the files of its archive.
 *
 * @param {Record<string, unknown>} manifest - Packed package manifest.
 * @param {string[]} files - Paths of the archive files, relative to the package root.
 * @returns {string[]} One message per missing file; empty if nothing is missing.
 */
export function findMissingFiles(manifest, files) {
  const archive = new Set(files);
  const shipsDeclarations = files.some(file => /\.d\.[cm]?ts$/.test(file));
  const { entries, bins } = manifestTargets(manifest);
  const problems = [];
  for (const target of [...entries, ...bins]) {
    const found = target.includes('*') ? files.some(file => patternExpression(target).test(file)) : archive.has(target);
    if (!found) problems.push(`${target} is not in the archive.`);
  }
  if (shipsDeclarations) {
    for (const target of entries) {
      if (target.includes('*') || !/\.[cm]?js$/.test(target)) continue;
      const declaration = target.replace(/\.([cm]?)js$/, '.d.$1ts');
      if (archive.has(target) && !archive.has(declaration)) problems.push(`${declaration} is not in the archive.`);
    }
  }
  return problems;
}

/**
 * Packs the workspace in a directory and checks the archive.
 *
 * @param {string} [directory] - Workspace directory; defaults to the current directory.
 * @returns {Promise<{name: string, files: number} | undefined>} Name and file
 *   count of the checked archive, or `undefined` for a private workspace.
 * @throws {Error} If packing fails or the archive does not match its workspace.
 */
export async function checkPack(directory = process.cwd()) {
  const source = parseManifest(await readFile(join(directory, 'package.json'), 'utf8'));
  if (source.private === true) return;
  const destination = await mkdtemp(join(tmpdir(), 'check-pack-'));
  try {
    const { stdout } = await execFileAsync('pnpm', ['pack', '--json', '--pack-destination', destination], {
      cwd: directory,
      encoding: 'utf8',
    });
    const result = parseManifest(stdout);
    if (typeof result.filename !== 'string' || !Array.isArray(result.files)) {
      throw new TypeError('Unexpected output of pnpm pack --json.');
    }
    const archive = resolve(destination, result.filename);
    const packed = await execFileAsync('tar', ['-xOf', archive, 'package/package.json'], { encoding: 'utf8' });
    const manifest = parseManifest(packed.stdout);
    if (manifest.name !== source.name || manifest.version !== source.version) {
      throw new Error(
        `Archive identity mismatch: expected ${String(source.name)}@${String(source.version)}, found ${String(manifest.name)}@${String(manifest.version)}.`,
      );
    }
    assertNoWorkspaceRanges(manifest, 'Pack the workspace with pnpm.');
    const files = result.files.map(file => (isRecord(file) && typeof file.path === 'string' ? file.path : ''));
    const problems = findMissingFiles(manifest, files);
    if (problems.length > 0) {
      throw new Error(`The archive of ${String(source.name)} misses files:\n${problems.join('\n')}`);
    }
    return { name: String(source.name), files: files.length };
  } finally {
    await rm(destination, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    const checked = await checkPack();
    process.stdout.write(
      checked ? `✅ ${checked.name} packs ${checked.files} files.\n` : 'Private workspace, nothing to pack.\n',
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
