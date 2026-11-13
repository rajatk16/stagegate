import { resolve } from 'node:path';

import { prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createReactConfig } from '@stagegate/eslint-config/react';

export default [
  ...createReactConfig({
    tsconfigRootDir: import.meta.dirname,
    vite: true,
  }),
  {
    name: 'stagegate/web/import-resolution',
    files: ['**/*.{ts,tsx}'],
    settings: {
      'import/internal-regex': '^@/',
      'import/resolver': {
        typescript: {
          project: [
            resolve(import.meta.dirname, 'tsconfig.app.json'),
            resolve(import.meta.dirname, 'tsconfig.node.json'),
          ],
        },
      },
    },
    rules: {
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
  {
    name: 'stagegate/web/tests',
    files: ['src/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },

  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),
    workspaceRoot: import.meta.dirname,
    browser: true,
  }),
  prettierConfig,
];
