import {
  DEFAULT_OPTIONS_LABEL,
  DEFAULT_PARAMETERS_LABEL,
  DEFAULT_SIGINT_HANDLER,
  DEFAULT_SIGINT_MESSAGE,
  DEFAULT_USAGE_LABEL,
} from '../src/schemas/options-defaults.js';
import type { ParsedOptions } from '../src/schemas/options-schema.js';
import type { ClirkContext, ClirkContextWithoutMessages } from '../src/types/clirk-context.interface.js';

/**
 * Creates an options object with default values for testing.
 *
 * @param overrides - Partial overrides for the default options.
 * @returns A ParsedOptions object with the specified overrides.
 */
export function mockOptions(overrides: Partial<ParsedOptions> = {}): ParsedOptions {
  return {
    importMetaDirname: '/test/path/to/pkg/src',
    argsOptions: { string: [], boolean: [], alias: {}, default: {}, ...overrides.argsOptions },
    title: 'Test CLI',
    description: [],
    examples: [],
    usage: [],
    usageLabel: DEFAULT_USAGE_LABEL,
    parameters: {},
    parametersLabel: DEFAULT_PARAMETERS_LABEL,
    options: {},
    optionsLabel: DEFAULT_OPTIONS_LABEL,
    sigintHandler: DEFAULT_SIGINT_HANDLER,
    sigintMessage: DEFAULT_SIGINT_MESSAGE,
    icon: undefined,
    ...overrides,
  };
}

/**
 * Creates a ClirkContextWithoutMessages object with default values for testing.
 *
 * @param overrides - Partial overrides for the default context.
 * @returns A ClirkContextWithoutMessages object with the specified overrides.
 */
export function mockContextWithoutMessages(
  overrides: Partial<ClirkContextWithoutMessages> = {},
): ClirkContextWithoutMessages {
  return {
    importPath: '/test/path/to/pkg/src',
    argsOptions: { string: [], boolean: [], alias: {}, default: {}, ...overrides.argsOptions },
    args: { _: [], ...overrides.args },
    title: 'Test CLI',
    name: 'test-cli',
    commandName: 'test-cli',
    description: [],
    package: {
      packageJson: {
        name: 'test-cli',
        version: '0.1.0',
      },
      path: '/test/path/to/pkg',
    },
    examples: [],
    usage: [],
    usageLabel: DEFAULT_USAGE_LABEL,
    parameters: new Map(overrides.parameters ?? []),
    parametersLabel: DEFAULT_PARAMETERS_LABEL,
    options: new Map(overrides.options ?? []),
    optionsLabel: DEFAULT_OPTIONS_LABEL,
    sigintHandler: DEFAULT_SIGINT_HANDLER,
    sigintMessage: DEFAULT_SIGINT_MESSAGE,
    icon: undefined,
    ...overrides,
  };
}

/**
 * Creates a ClirkContext object with default values for testing.
 *
 * @param overrides - Partial overrides for the default context.
 * @returns A ClirkContext object with the specified overrides.
 */
export function mockContext(overrides: Partial<ClirkContext> = {}): ClirkContext {
  return {
    ...mockContextWithoutMessages(overrides),
    getHelpMessage: () => '[help message]',
    getVersionMessage: () => '[version message]',
    ...overrides,
  };
}
