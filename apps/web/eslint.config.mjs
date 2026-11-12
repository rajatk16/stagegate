import { resolve } from 'node:path';

import { prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createReactConfig } from '@stagegate/eslint-config/react';

export default [
  ...createReactConfig({
    tsconfigRootDir: import.meta.dirname,
  }),

  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),

    workspaceRoot: import.meta.dirname,

    browser: true,
  }),

  prettierConfig,
];
