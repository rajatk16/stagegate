import { resolve } from 'node:path';

import { createNodeConfig } from '@stagegate/eslint-config/node';

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  ...createNodeConfig({
    tsconfigRootDir: import.meta.dirname,
    nest: true,
  }),
  {
    name: 'stagegate/api/typescript',
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: resolve(import.meta.dirname, 'tsconfig.json'),
        },
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'separate-type-imports',
        },
      ],
    },
  },
  {
    name: 'stagegate/api/jest-config',
    files: ['jest*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    name: 'stagegate/api/nest-modules',
    files: ['src/app.module.ts', 'src/**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    name: 'stagegate/api/tests',
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
];
