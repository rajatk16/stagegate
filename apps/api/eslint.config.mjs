import { resolve } from 'node:path';

import { prettierConfig } from '@stagegate/eslint-config/base';
import { createBoundaryConfig } from '@stagegate/eslint-config/boundaries';
import { createNodeConfig } from '@stagegate/eslint-config/node';

export default [
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,

    nest: true,
  }),

  ...createBoundaryConfig({
    repositoryRoot: resolve(import.meta.dirname, '../..'),

    workspaceRoot: import.meta.dirname,
  }),

  prettierConfig,
];
