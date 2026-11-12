import { defineConfig } from 'eslint/config';
import globals from 'globals';

import { sourceFiles } from './base.mjs';
import { createTypeScriptConfig } from './typescript.mjs';

export function createNodeConfig({ tsconfigRootDir, typeChecked = true, nest = false } = {}) {
  return defineConfig([
    ...createTypeScriptConfig({
      tsconfigRootDir,
      typeChecked,
    }),

    {
      name: 'stagegate/node',

      files: sourceFiles,

      languageOptions: {
        globals: {
          ...globals.node,
        },
      },

      rules: {
        'no-console': [
          'error',
          {
            allow: ['warn', 'error'],
          },
        ],
      },
    },

    ...(nest
      ? [
          {
            name: 'stagegate/nest',

            files: ['src/**/*.ts'],

            rules: {
              // NestJS uses runtime decorator metadata.
              // Some imports must remain value imports
              // for dependency injection to work.
              '@typescript-eslint/consistent-type-imports': 'off',
            },
          },
        ]
      : []),
  ]);
}
