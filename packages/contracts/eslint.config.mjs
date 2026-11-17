import { resolve } from 'node:path';

import globals from 'globals';

import { prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createNodeConfig } from '@stagegate/eslint-config/node';

export default [
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),
    workspaceRoot: import.meta.dirname,
    browser: true,
  }),

  {
    name: 'stagegate/contracts/tooling',

    files: ['*.config.mjs'],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['src/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'node:*',
            'firebase-admin',
            'firebase-admin/*',
            '@nestjs/*',
            'react',
            'react/*',
            'axios',
          ],
        },
      ],
    },
  },
  prettierConfig,
];
