import type { Linter } from 'eslint';

import { setRulesToOff } from '../utils/set-rules-to-off.js';

/**
 * `typescript-eslint` Rules
 *
 * @see {@link https://typescript-eslint.io/rules/ Rules}
 */
export const typescriptEslintRules: Linter.RulesRecord = {
  /**
   * Customizations on rules from the `typescript-eslint#recommendedTypeChecked`
   * configuration
   */
  '@typescript-eslint/unbound-method': [
    'error',
    {
      ignoreStatic: true,
    },
  ],
  '@typescript-eslint/restrict-template-expressions': [
    'error',
    {
      allow: ['Error', 'URL', 'URLSearchParams'],
      allowAny: false,
      allowBoolean: false,
      allowNullish: false,
      allowNumber: true,
      allowRegExp: false,
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    {
      args: 'all',
      argsIgnorePattern: '^_',
      caughtErrors: 'all',
      caughtErrorsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true,
    },
  ],

  /**
   * Customizations on rules from the `typescript-eslint#strictTypeChecked`
   * configuration
   */
  '@typescript-eslint/no-extraneous-class': [
    'error',
    {
      allowConstructorOnly: false,
      allowEmpty: false,
      allowStaticOnly: false,
      allowWithDecorator: true,
    },
  ],

  /**
   * Additional rules to the predefined `typescript-eslint` configurations
   */
  '@typescript-eslint/consistent-type-exports': [
    'error',
    {
      fixMixedExportsWithInlineTypeSpecifier: true,
    },
  ],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    {
      disallowTypeAnnotations: true,
      fixStyle: 'inline-type-imports',
      prefer: 'type-imports',
    },
  ],
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    {
      allowConciseArrowFunctionExpressionsStartingWithVoid: true,
      allowDirectConstAssertionInArrowFunctions: true,
      allowExpressions: true,
      allowHigherOrderFunctions: true,
      allowTypedFunctionExpressions: true,
    },
  ],
  '@typescript-eslint/explicit-member-accessibility': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/member-ordering': 'error',
  '@typescript-eslint/method-signature-style': ['error', 'property'],

  '@typescript-eslint/naming-convention': [
    'error',
    {
      // These selectors should have no formatting checks
      selector: ['import', 'objectLiteralProperty', 'typeProperty'],
      format: null,
    },
    {
      selector: 'default',
      format: ['strictCamelCase'],
      leadingUnderscore: 'forbid',
      trailingUnderscore: 'forbid',
    },
    {
      selector: 'variable',
      format: ['strictCamelCase', 'StrictPascalCase', 'UPPER_CASE'],
    },
    {
      selector: 'typeLike',
      format: ['StrictPascalCase'],
    },
    {
      selector: 'enumMember',
      format: ['StrictPascalCase'],
    },
    {
      selector: 'parameter',
      format: ['strictCamelCase'],
      // allow leading underscores for unused parameters (typescript internal convention)
      leadingUnderscore: 'allow',
      trailingUnderscore: 'forbid',
    },
  ],

  '@typescript-eslint/no-import-type-side-effects': 'error',
  '@typescript-eslint/no-unnecessary-parameter-property-assignment': 'error',
  '@typescript-eslint/no-unnecessary-qualifier': 'error',
  '@typescript-eslint/no-useless-empty-export': 'error',
  '@typescript-eslint/prefer-readonly': 'error',
  '@typescript-eslint/prefer-enum-initializers': 'error',
  '@typescript-eslint/promise-function-async': 'error',
  '@typescript-eslint/require-array-sort-compare': 'error',

  /**
   * Replacement Rules
   *
   * Replacement rules are rules that replace native eslint rules with
   * typescript-eslint rules.
   */
  'default-param-last': 'off',
  '@typescript-eslint/default-param-last': 'error',

  'no-empty-function': 'off',
  '@typescript-eslint/no-empty-function': [
    'error',
    {
      allow: ['arrowFunctions'],
    },
  ],

  'no-loop-func': 'off',
  '@typescript-eslint/no-loop-func': 'error',

  'no-magic-numbers': 'off',
  '@typescript-eslint/no-magic-numbers': [
    'error',
    {
      ignore: [-1, 0, 1, 2],
      ignoreArrayIndexes: true,
      enforceConst: false,
      detectObjects: false,
      ignoreEnums: true,
      ignoreNumericLiteralTypes: true,
      ignoreReadonlyClassProperties: true,
      ignoreTypeIndexes: true,
    },
  ],

  'no-shadow': 'off',
  '@typescript-eslint/no-shadow': [
    'error',
    {
      builtinGlobals: false,
      hoist: 'all',
    },
  ],

  'no-use-before-define': 'off',
  '@typescript-eslint/no-use-before-define': [
    'error',
    {
      functions: false,
      classes: false,
      variables: true,
      allowNamedExports: false,
      enums: true,
      typedefs: true,
    },
  ],

  /**
   * Disabled Rules
   */
  ...setRulesToOff([
    // Reason: conflicts with '@typescript-eslint/member-ordering' when using getters and setters
    '@typescript-eslint/adjacent-overload-signatures',

    // Reason: conflicts with '@typescript-eslint/no-non-null-assertion'
    '@typescript-eslint/non-nullable-type-assertion-style',
  ]),
};
