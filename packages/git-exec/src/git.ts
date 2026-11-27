import { execFile } from 'node:child_process';
import { cwd as processCwd, env as processEnv } from 'node:process';
import { promisify } from 'node:util';

import { GitError } from './git-error.js';
import type { GitOptions } from './git-exec.types.js';

const execFileAsync = promisify(execFile);

/**
 * The default for `maxBuffer`: 1 GiB, enough for large diffs and blobs.
 */
const DEFAULT_MAX_BUFFER = 1_073_741_824;

/**
 * Runs a Git command and returns its raw standard output, for binary data.
 *
 * @param args - The Git arguments.
 * @param options - Options for running the command.
 * @returns The standard output as buffer.
 * @throws {GitError} if Git cannot be started, exits with a non-zero code, or exceeds `maxBuffer`.
 */
export async function gitBuffer(args: readonly string[], options: GitOptions = {}): Promise<Buffer> {
  const { cwd = processCwd(), env, maxBuffer = DEFAULT_MAX_BUFFER, debug } = options;

  debug?.(`Running ${formatCommand(args)} in ${cwd}`);

  try {
    const { stdout } = await execFileAsync('git', args, {
      cwd,
      env: env ? { ...processEnv, ...env } : processEnv,
      encoding: 'buffer',
      maxBuffer,
    });
    return stdout;
  } catch (error) {
    throw toGitError(args, error);
  }
}

/**
 * Runs a Git command and returns its standard output as trimmed text.
 *
 * @param args - The Git arguments.
 * @param options - Options for running the command.
 * @returns The standard output as UTF-8 text without leading and trailing whitespace.
 * @throws {GitError} if Git cannot be started, exits with a non-zero code, or exceeds `maxBuffer`.
 */
export async function git(args: readonly string[], options: GitOptions = {}): Promise<string> {
  return (await gitBuffer(args, options)).toString('utf8').trim();
}

/**
 * Runs a Git command and reports whether it exited with code 0.
 *
 * Only a non-zero exit code counts as failure; it is passed to `debug`.
 *
 * @param args - The Git arguments.
 * @param options - Options for running the command.
 * @returns `true` if the command exited with code 0, `false` for any other exit code.
 * @throws {GitError} if Git cannot be started, is terminated, or exceeds `maxBuffer`.
 */
export async function gitSucceeds(args: readonly string[], options: GitOptions = {}): Promise<boolean> {
  try {
    await gitBuffer(args, options);
    return true;
  } catch (error) {
    if (error instanceof GitError && error.exitCode !== undefined) {
      options.debug?.(error.message);
      return false;
    }
    throw error;
  }
}

/**
 * Formats a Git command for messages, quoting arguments that contain special characters.
 *
 * @param args - The Git arguments.
 * @returns The command line.
 */
function formatCommand(args: readonly string[]): string {
  return ['git', ...args].map(arg => (/^[\w%+,./:=@^~-]+$/.test(arg) ? arg : JSON.stringify(arg))).join(' ');
}

/**
 * Converts an error of `execFile` into a `GitError`.
 *
 * @param args - The Git arguments.
 * @param error - The error of `execFile`.
 * @returns The Git error.
 */
function toGitError(args: readonly string[], error: unknown): GitError {
  const { code, signal, stderr } = (error ?? {}) as { code?: unknown; signal?: unknown; stderr?: unknown };

  const exitCode = typeof code === 'number' ? code : undefined;
  const stderrText = (
    Buffer.isBuffer(stderr) ? stderr.toString('utf8') : typeof stderr === 'string' ? stderr : ''
  ).trim();

  let reason: string;
  if (exitCode !== undefined) {
    reason = `exit code ${exitCode}`;
  } else if (typeof code !== 'string' && typeof signal === 'string') {
    reason = `terminated by ${signal}`;
  } else {
    reason = error instanceof Error ? error.message : String(error);
  }

  return new GitError(`${formatCommand(args)} failed (${reason})${stderrText ? `: ${stderrText}` : ''}`, {
    args,
    exitCode,
    stderr: stderrText,
    cause: error,
  });
}
