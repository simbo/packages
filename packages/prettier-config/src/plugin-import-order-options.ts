/**
 * Plugin Options for `@ianvs/prettier-plugin-sort-imports`
 *
 * @see {@link https://github.com/ianvs/prettier-plugin-sort-imports Sort Imports Plugin}
 */
export const importOrderOptions = {
  importOrder: ['<BUILTIN_MODULES>', '', '<THIRD_PARTY_MODULES>', '', '^src/', '', '^[.][.](/|$)', '', '^[.](/|$)'],
  importOrderParserPlugins: ['typescript', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.8.2',
};
