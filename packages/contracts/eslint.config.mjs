import { resolve } from 'node:path';

import globals from 'globals';

import { prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createTypeScriptConfig } from '@stagegate/eslint-config/typescript';

export default [
  ...createTypeScriptConfig({
    tsconfigRootDir: import.meta.dirname,
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

  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),

    workspaceRoot: import.meta.dirname,
  }),

  prettierConfig,
];
