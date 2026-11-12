import eslint from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import importPlugin from 'eslint-plugin-import';

export const javascriptFiles = ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'];

export const typescriptFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

export const sourceFiles = [...javascriptFiles, ...typescriptFiles];

export const baseConfig = defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/out/**',
    '**/coverage/**',
    '**/.turbo/**',
    '**/.next/**',
    '**/.vite/**',
    '**/.cache/**',
    '**/.firebase/**',
    '**/.terraform/**',
    '**/playwright-report/**',
    '**/test-results/**',
    '**/firebase-emulator-data/**',
    '**/*.generated.js',
    '**/*.generated.ts',
    '**/*.tsbuildinfo',
  ]),

  {
    name: 'stagegate/base',

    files: sourceFiles,

    extends: [eslint.configs.recommended],

    plugins: {
      import: importPlugin,
    },

    linterOptions: {
      reportUnusedDisableDirectives: 'error',
      reportUnusedInlineConfigs: 'error',
    },

    languageOptions: {
      ecmaVersion: 'latest',
    },

    rules: {
      'no-var': 'error',

      'prefer-const': 'error',

      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],

      curly: ['error', 'all'],

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-debugger': 'error',

      'no-alert': 'error',

      'no-eval': 'error',

      'no-implied-eval': 'error',

      'no-new-func': 'error',

      'no-throw-literal': 'error',

      'no-duplicate-imports': 'off',

      'object-shorthand': ['error', 'always'],

      'prefer-template': 'error',

      'prefer-object-spread': 'error',

      'no-param-reassign': [
        'error',
        {
          props: false,
        },
      ],

      'import/first': 'error',

      'import/no-duplicates': 'error',

      'import/no-self-import': 'error',

      'import/no-absolute-path': 'error',

      'import/newline-after-import': [
        'error',
        {
          count: 1,
        },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          pathGroups: [
            {
              pattern: '@stagegate/**',
              group: 'internal',
              position: 'before',
            },
          ],

          pathGroupsExcludedImportTypes: ['builtin', 'type'],

          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);

export const prettierConfig = eslintConfigPrettier;
