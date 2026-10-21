/**
 * Creates the Markdown body for a stable package release from its changelog.
 *
 * Run from the tagged repository root with RELEASE_TAG and RUNNER_TEMP set.
 * Markdown indentation and internal blank lines are preserved; only surrounding
 * blank lines are removed. The timestamp always uses Europe/Berlin. No external
 * commands or dependencies are needed, and imports have no CLI side effects.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

import { parseTag } from './release-package.js';

/**
 * Extracts one exact version section and prepends the Berlin release timestamp.
 *
 * @param {string} changelog - Complete changelog Markdown.
 * @param {string} version - Version heading to select, without its Markdown prefix.
 * @param {Date} [date] - Release time, injectable for deterministic tests.
 * @returns {string} Release Markdown with a final newline.
 * @throws {Error} If the version section is missing or contains only whitespace.
 */
export function createReleaseNotes(changelog, version, date = new Date()) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.indexOf(`## ${version}`);
  const section = start === -1 ? [] : lines.slice(start + 1);
  const next = section.findIndex(line => line.startsWith('## '));
  const body = next === -1 ? section : section.slice(0, next);
  const first = body.findIndex(line => line.trim().length > 0);
  if (first === -1) throw new Error(`Missing Release Notes: No changelog entry for ${version}.`);
  const last = body.findLastIndex(line => line.trim().length > 0);
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const timestamp = `${values.year}-${values.month}-${values.day} ${values.hour}:${values.minute}:${values.second} ${values.timeZoneName}`;
  return `_${timestamp}_\n\n${body.slice(first, last + 1).join('\n')}\n`;
}

/**
 * Reads the tagged workspace changelog and writes the workflow's release body.
 *
 * @param {string} tag - Stable workspace release tag.
 * @param {string} temporaryDirectory - Runner temporary directory.
 * @param {string} [root] - Repository root containing packages/.
 * @returns {string} Absolute or root-relative path of the generated Markdown file.
 * @throws {Error} If inputs, changelog content or filesystem operations are invalid.
 */
export function writeReleaseNotes(tag, temporaryDirectory, root = process.cwd()) {
  const { workspace, version } = parseTag(tag);
  if (!temporaryDirectory) throw new Error('Missing RUNNER_TEMP: Expected a release output directory.');
  const changelog = join(root, 'packages', workspace, 'CHANGELOG.md');
  let source;
  try {
    source = readFileSync(changelog, 'utf8');
  } catch (error) {
    throw new Error(`Missing Changelog: Cannot read ${changelog} at ${tag}.`, { cause: error });
  }
  const notes = createReleaseNotes(source, version);
  const directory = join(temporaryDirectory, 'package-release');
  mkdirSync(directory, { recursive: true });
  const output = join(directory, 'RELEASE_NOTES.md');
  writeFileSync(output, notes);
  return output;
}

if (process.argv[1] && resolve(process.argv[1]) === import.meta.filename) {
  try {
    const output = writeReleaseNotes(process.env.RELEASE_TAG ?? '', process.env.RUNNER_TEMP ?? '');
    process.stdout.write(`📝 Release notes written to ${output}\n`);
  } catch (error) {
    const message = (error instanceof Error ? error.message : String(error))
      .replaceAll('%', '%25')
      .replaceAll('\r', '%0D')
      .replaceAll('\n', '%0A');
    process.stderr.write(`::error title=Release Notes Failed::${message}\n`);
    process.exitCode = 1;
  }
}
