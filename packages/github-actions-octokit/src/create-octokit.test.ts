import { createServer, type IncomingHttpHeaders, type OutgoingHttpHeaders, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import process from 'node:process';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createOctokit, RATE_LIMIT_MAX_RETRIES, shouldRetryOnRateLimit } from './create-octokit.js';
import { hasStatus } from './has-status.js';

interface Reply {
  status: number;
  headers?: OutgoingHttpHeaders;
  body: unknown;
}

let server: Server;
let baseUrl: string;
let replies: Reply[];
let received: IncomingHttpHeaders[];
let output: string[];

/**
 * Queues the replies of the local server; the last one repeats.
 *
 * @param queue - The replies in order.
 */
function reply(...queue: Reply[]): void {
  replies = queue;
}

/**
 * Returns the warnings that `@actions/core` wrote to the standard output.
 *
 * @returns The warning messages.
 */
function warnings(): string[] {
  return output.filter(line => line.startsWith('::warning::')).map(line => line.slice('::warning::'.length).trim());
}

beforeEach(async () => {
  replies = [];
  received = [];
  output = [];
  vi.spyOn(process.stdout, 'write').mockImplementation(chunk => {
    output.push(String(chunk));
    return true;
  });
  server = createServer((request, response) => {
    received.push(request.headers);
    const next = replies.length > 1 ? replies.shift() : replies[0];
    const { status, headers, body } = next ?? { status: 500, body: { message: 'No reply queued' } };
    response.writeHead(status, { 'content-type': 'application/json', ...headers });
    response.end(JSON.stringify(body));
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterEach(async () => {
  vi.restoreAllMocks();
  await new Promise(resolve => server.close(resolve));
});

const secondaryLimit: Reply = {
  status: 403,
  headers: { 'retry-after': '0.001' },
  body: { message: 'You have exceeded a secondary rate limit.' },
};

const primaryLimit: Reply = {
  status: 403,
  headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '0' },
  body: { message: 'API rate limit exceeded.' },
};

const repository: Reply = { status: 200, body: { default_branch: 'main' } };

describe('shouldRetryOnRateLimit', () => {
  const request = { method: 'POST', url: '/repos/{owner}/{repo}/git/refs' };

  it('retries and warns below the maximum', () => {
    expect(shouldRetryOnRateLimit('secondary', 60, request, 0)).toBe(true);
    expect(warnings()).toEqual([
      'The secondary rate limit was reached for POST /repos/{owner}/{repo}/git/refs; retrying in 60 seconds (retry 1 of 4).',
    ]);
  });

  it('gives up at the maximum', () => {
    expect(shouldRetryOnRateLimit('primary', 60, request, RATE_LIMIT_MAX_RETRIES)).toBe(false);
    expect(warnings()).toEqual([
      'The primary rate limit persists for POST /repos/{owner}/{repo}/git/refs; giving up after 4 retries.',
    ]);
  });
});

describe('createOctokit', () => {
  it('authenticates requests with the token', async () => {
    reply(repository);
    const octokit = createOctokit('test-token', { baseUrl });

    const { data } = await octokit.rest.repos.get({ owner: 'owner', repo: 'repo' });

    expect(data.default_branch).toBe('main');
    expect(received[0]?.authorization).toBe('token test-token');
  });

  it('retries a request that hit the secondary rate limit', async () => {
    reply(secondaryLimit, repository);
    const octokit = createOctokit('test-token', { baseUrl });

    const { data } = await octokit.rest.repos.get({ owner: 'owner', repo: 'repo' });

    expect(data.default_branch).toBe('main');
    expect(received).toHaveLength(2);
    expect(warnings()).toEqual([
      'The secondary rate limit was reached for GET /repos/{owner}/{repo}; retrying in 0.001 seconds (retry 1 of 4).',
    ]);
  });

  it('gives up on a persisting primary rate limit', async () => {
    reply(primaryLimit);
    const octokit = createOctokit('test-token', { baseUrl });

    const rejection = await octokit.rest.repos.get({ owner: 'owner', repo: 'repo' }).catch((error: unknown) => error);

    expect(hasStatus(rejection, 403)).toBe(true);
    expect(received).toHaveLength(RATE_LIMIT_MAX_RETRIES + 1);
    expect(warnings()).toHaveLength(RATE_LIMIT_MAX_RETRIES + 1);
    expect(warnings().at(-1)).toBe(
      'The primary rate limit persists for GET /repos/{owner}/{repo}; giving up after 4 retries.',
    );
  });

  it('replaces rate limit handlers of the options', async () => {
    reply(secondaryLimit, repository);
    const onSecondaryRateLimit = vi.fn(() => false);
    const octokit = createOctokit('test-token', {
      baseUrl,
      throttle: { onRateLimit: () => false, onSecondaryRateLimit },
    });

    await octokit.rest.repos.get({ owner: 'owner', repo: 'repo' });

    expect(onSecondaryRateLimit).not.toHaveBeenCalled();
    expect(received).toHaveLength(2);
  });

  it('rejects other failures without retrying', async () => {
    reply({ status: 404, body: { message: 'Not Found' } });
    const octokit = createOctokit('test-token', { baseUrl });

    const rejection = await octokit.rest.repos.get({ owner: 'owner', repo: 'repo' }).catch((error: unknown) => error);

    expect(hasStatus(rejection, 404)).toBe(true);
    expect(received).toHaveLength(1);
    expect(warnings()).toEqual([]);
  });
});
