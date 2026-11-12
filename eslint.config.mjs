import globals from 'globals';

import { baseConfig, prettierConfig } from '@stagegate/eslint-config/base';

export default [
  ...baseConfig,

  {
    name: 'stagegate/repository-tooling',

    files: [
      '*.mjs',
      'scripts/**/*.mjs',
      'packages/eslint-config/**/*.mjs',
      'apps/*/eslint.config.mjs',
      'packages/*/eslint.config.mjs',
    ],

    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Repository CLI tools intentionally write
      // status messages to stdout.
      'no-console': 'off',
    },
  },

  prettierConfig,
];
