import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

import { baseConfig, typescriptFiles } from './base.mjs';

export function createTypeScriptConfig({ tsconfigRootDir, typeChecked = true } = {}) {
  if (!tsconfigRootDir) {
    throw new Error('tsconfigRootDir is required.');
  }

  const recommendedConfigs = typeChecked
    ? tseslint.configs.strictTypeChecked
    : tseslint.configs.strict;

  const stylisticConfigs = typeChecked
    ? tseslint.configs.stylisticTypeChecked
    : tseslint.configs.stylistic;

  return defineConfig([
    ...baseConfig,

    {
      name: 'stagegate/typescript',

      files: typescriptFiles,

      extends: [recommendedConfigs, stylisticConfigs],

      languageOptions: {
        parser: tseslint.parser,

        parserOptions: {
          tsconfigRootDir,

          projectService: typeChecked,
        },
      },

      settings: {
        'import/resolver': {
          typescript: {
            project: `${tsconfigRootDir}/tsconfig.json`,
          },

          node: {
            extensions: ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.mts', '.cts'],
          },
        },
      },

      rules: {
        'no-unused-vars': 'off',

        'no-throw-literal': 'off',

        'no-undef': 'off',

        '@typescript-eslint/no-explicit-any': 'error',

        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            args: 'all',
            argsIgnorePattern: '^_',

            varsIgnorePattern: '^_',

            caughtErrors: 'all',
            caughtErrorsIgnorePattern: '^_',

            destructuredArrayIgnorePattern: '^_',

            ignoreRestSiblings: true,
          },
        ],

        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'separate-type-imports',
          },
        ],

        '@typescript-eslint/consistent-type-exports': [
          'error',
          {
            fixMixedExportsWithInlineTypeSpecifier: true,
          },
        ],

        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

        '@typescript-eslint/ban-ts-comment': [
          'error',
          {
            'ts-expect-error': 'allow-with-description',
            'ts-ignore': true,
            'ts-nocheck': true,
            'ts-check': false,
            minimumDescriptionLength: 10,
          },
        ],

        '@typescript-eslint/no-non-null-assertion': 'error',

        '@typescript-eslint/no-require-imports': 'error',

        'import/no-unresolved': [
          'error',
          {
            commonjs: true,
            caseSensitive: true,
          },
        ],

        ...(typeChecked
          ? {
              '@typescript-eslint/no-floating-promises': [
                'error',
                {
                  ignoreVoid: true,
                  ignoreIIFE: false,
                },
              ],

              '@typescript-eslint/no-misused-promises': 'error',

              '@typescript-eslint/await-thenable': 'error',

              '@typescript-eslint/only-throw-error': 'error',

              '@typescript-eslint/no-unsafe-assignment': 'error',

              '@typescript-eslint/no-unsafe-member-access': 'error',

              '@typescript-eslint/no-unsafe-call': 'error',

              '@typescript-eslint/no-unsafe-return': 'error',

              '@typescript-eslint/no-unsafe-argument': 'error',

              '@typescript-eslint/switch-exhaustiveness-check': 'error',

              '@typescript-eslint/require-await': 'error',
            }
          : {}),
      },
    },
  ]);
}
