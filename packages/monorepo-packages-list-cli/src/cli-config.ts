import type { ClirkOptions } from '@simbo/clirk';

export const CLI_CONFIG: ClirkOptions = {
  importMetaDirname: import.meta.dirname,
  argsOptions: {
    string: ['config'],
    alias: { config: ['c'] },
  },
  title: 'Monorepo Packages List CLI',
  icon: '📋',
  description: [
    "Generates a list of a monorepo's packages details and injects it to a target file.",
    ' ',
    'A target file should contain a HTML comment with the format:',
    '  <!-- PACKAGES --><!-- /PACKAGES -->',
    ' ',
    'The output can be customized by providing a configuration file.',
    'See the README.md for more information.',
    ' ',
    'The base path for all relative paths and the working directory for subprocesses will be the root path of the monorepo detected from the current working directory.',
  ],
  examples: 'monorepo-packages-list [OPTIONS] [<FILE> ...]',
  parameters: {
    FILE: ['One or more target files to inject the generated content into.', 'Default: "README.md"'],
  },
  options: {
    config: [
      'A custom path to a JavaScript or TypeScript configuration file.',
      'Defaults to multiple fallbacks: "(monorepo-)?packages-list.config.(ts|js)"',
    ],
  },
};
