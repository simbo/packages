import { env } from 'node:process';

import { getInput } from '@actions/core';

import type { Repository } from './github-actions-utils.types.js';

/**
 * Matches `owner/repo` with letters, digits, `_`, `.`, and `-` in both parts.
 */
const REPOSITORY_PATTERN = /^([\w.-]+)\/([\w.-]+)$/;

/**
 * Parses a repository input in the format `owner/repo`.
 *
 * If the input is empty or not set, the repository the workflow runs in is used,
 * from the environment variable `GITHUB_REPOSITORY`. Surrounding whitespace is
 * ignored.
 *
 * @param name - The name of the input.
 * @returns The owner and the name of the repository.
 * @throws {Error} if neither the input nor `GITHUB_REPOSITORY` is set, or the
 * value is not in the format `owner/repo`.
 */
export function parseRepository(name = 'repository'): Repository {
  const value = getInput(name) || (env.GITHUB_REPOSITORY ?? '');
  if (value === '') {
    throw new Error(`Input required: "${name}" (GITHUB_REPOSITORY is not set either).`);
  }
  const match = REPOSITORY_PATTERN.exec(value);
  if (!match || match[2] === '.' || match[2] === '..') {
    throw new Error(`Invalid input "${name}": "${value}" (expected "owner/repo").`);
  }
  return { owner: match[1], repo: match[2] };
}
