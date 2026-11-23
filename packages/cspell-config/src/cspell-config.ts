import type { CSpellUserSettings } from 'cspell';

/**
 * Simbo's shared CSpell configuration.
 *
 * @see {@link https://cspell.org/ CSpell}
 * @see {@link https://cspell.org/docs/Configuration/properties CSpell Configuration Properties}
 */
export const config: CSpellUserSettings = {
  description: "Simbo's Shared CSpell Configuration",

  // Define text content file types to scan
  files: ['**/*.(md|mdx|txt)'],
  enableGlobDot: true,

  // Ignore typical directories that should not be scanned
  ignorePaths: [
    '**/.git/**',
    '**/.turbo/**',
    '**/.angular/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/cache/**',
  ],

  // Ignore specific patterns
  ignoreRegExpList: [
    // Markdown fenced code blocks
    '/\\s*`{3,}.*[\\s\\S]*?\\s*`{3,}/gm',
    // Markdown inline code
    '`[^`]*`',
  ],

  // Changesets prefixes changelog entries with seven-character commit hashes.
  overrides: [
    {
      filename: '**/CHANGELOG.md',
      ignoreRegExpList: [String.raw`/^\s*- [0-9a-f]{7}(?=:)/gmi`],
    },
  ],

  // A word must be at least 3 characters long
  minWordLength: 3,

  // Scan case-insensitively
  caseSensitive: false,

  // Allow combined words
  allowCompoundWords: true,

  // Add custom dictionaries
  dictionaries: ['simbo-words', 'simbo-abbreviations'],
  dictionaryDefinitions: [
    {
      name: 'simbo-words',
      path: '../dictionaries/words.txt',
      addWords: false,
    },
    {
      name: 'simbo-abbreviations',
      path: '../dictionaries/abbreviations.txt',
      addWords: false,
    },
  ],
};
