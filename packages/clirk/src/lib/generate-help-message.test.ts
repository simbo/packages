import { describe, expect, it, vi } from 'vitest';

import { mockContextWithoutMessages } from '../../tests/mocks.js';
import type { ClirkContextWithoutMessages } from '../types/clirk-context.interface.js';

import { generateHelpMessage } from './generate-help-message.js';

vi.mock('yoctocolors', () => ({
  bold: vi.fn((str: string) => `[b]${str}[/b]`),
  cyan: vi.fn((str: string) => `[c]${str}[/c]`),
  dim: vi.fn((str: string) => `[d]${str}[/d]`),
  underline: vi.fn((str: string) => `[u]${str}[/u]`),
  yellow: vi.fn((str: string) => `[y]${str}[/y]`),
}));

const getBaseContext = (overrides: Partial<ClirkContextWithoutMessages> = {}): ClirkContextWithoutMessages =>
  mockContextWithoutMessages({
    icon: '🧪',
    title: 'Test CLI',
    name: 'test-cli',
    commandName: 'test-cli',
    description: ['A test CLI to verify the help output.'],
    package: {
      path: '/path/to/package',
      packageJson: {
        name: 'test-cli',
        version: '1.0.0',
        homepage: 'https://example.com',
      },
    },
    examples: ['test-cli run', 'test-cli test'],
    usage: ['Use this CLI to test stuff.'],
    parameters: new Map([
      ['INPUT', { description: ['Input file path.'] }],
      ['OUTPUT', { description: ['Output file path.'] }],
    ]),
    options: new Map([
      [
        'verbose',
        {
          description: ['Enable verbose logging.'],
          aliases: new Set(['v']),
          type: 'boolean',
        },
      ],
      [
        'config',
        {
          description: ['Path to config file.'],
          aliases: new Set(['c']),
          type: 'string',
        },
      ],
    ]),
    ...overrides,
  });

describe('generateHelpMessage', () => {
  it('generates a complete help message with all sections', () => {
    const result = generateHelpMessage(getBaseContext());

    expect(result).toBe(`
🧪 [b][c]test-cli — Test CLI[/c][/b]

test-cli v1.0.0
[d][u]https://example.com[/u][/d]

A test CLI to verify the help output.

[b]USAGE:[/b]

  [y]test-cli run[/y]
  [y]test-cli test[/y]

  Use this CLI to test stuff.

[b]PARAMETERS:[/b]

  [y]INPUT[/y]
    Input file path.

  [y]OUTPUT[/y]
    Output file path.

[b]OPTIONS:[/b]

  [y]--verbose[/y]
    Enable verbose logging.
    [d]Alias: -v[/d]

  [y]--config[/y][d]=<VALUE>[/d]
    Path to config file.
    [d]Alias: -c[/d]
`);
  });

  it('renders options without aliases and without string type correctly', () => {
    const context = getBaseContext({
      usage: [],
      options: new Map([
        [
          'dry-run',
          {
            description: ['Runs without making changes.'],
            aliases: new Set(),
            type: 'boolean',
          },
        ],
      ]),
    });
    const result = generateHelpMessage(context);

    expect(result).toContain('--dry-run');
    expect(result).not.toContain('Aliases:');
  });

  it('skips icon when missing', () => {
    const context = getBaseContext({
      icon: undefined,
    });
    const result = generateHelpMessage(context);

    expect(result).not.toContain('🧪');
  });

  it('skips homepage when missing', () => {
    const context = getBaseContext({
      package: {
        packageJson: {
          name: 'test-cli',
          version: '1.0.0',
        },
        path: '/path/to/package',
      },
    });
    const result = generateHelpMessage(context);

    expect(result).not.toContain('https://example.com');
  });

  it('renders aliases with mixed lengths and applies correct prefixing', () => {
    const context = getBaseContext({
      options: new Map([
        [
          'mode',
          {
            description: ['Select the mode.'],
            aliases: new Set(['m', 'mode', 'M']),
            type: 'boolean',
          },
        ],
      ]),
    });
    const result = generateHelpMessage(context);

    expect(result).toContain('Aliases: -m, --mode, -M');
  });

  it('renders multiple aliases with correct plural label', () => {
    const context = getBaseContext({
      options: new Map([
        [
          'log',
          {
            description: ['Set log level.'],
            aliases: new Set(['l', 'log', 'logfile']),
            type: 'string',
          },
        ],
      ]),
    });
    const result = generateHelpMessage(context);

    expect(result).toMatch(/Aliases: (-l|--log|--logfile)(, )?/);
  });

  it('renders empty parameters and options sections gracefully', () => {
    const context = getBaseContext({
      parameters: new Map(),
      options: new Map(),
    });
    const result = generateHelpMessage(context);

    expect(result).not.toContain('PARAMETERS:');
    expect(result).not.toContain('OPTIONS:');
  });
});
