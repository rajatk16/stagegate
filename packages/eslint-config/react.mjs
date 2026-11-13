import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { createTypeScriptConfig } from './typescript.mjs';

export const createReactConfig = ({ tsconfigRootDir, typeChecked = true, vite = false } = {}) =>
  defineConfig([
    ...createTypeScriptConfig({
      tsconfigRootDir,
      typeChecked,
    }),

    {
      name: 'stagegate/react/browser',
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      languageOptions: {
        globals: {
          ...globals.browser,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
    },

    {
      name: 'stagegate/react/components',
      files: ['src/**/*.{jsx,tsx}'],
      plugins: {
        react,
        'jsx-a11y': jsxA11y,
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        ...react.configs.recommended.rules,
        ...react.configs['jsx-runtime'].rules,
        ...jsxA11y.configs.recommended.rules,

        'react/prop-types': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/jsx-uses-react': 'off',
        'react/jsx-key': 'error',
        'react/no-array-index-key': 'warn',
        'react/no-danger': 'error',
        'react/self-closing-comp': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/no-unstable-nested-components': 'error',
      },
    },

    {
      name: 'stagegate/react/hooks',
      files: ['src/**/*.{js,jsx,ts,tsx}'],
      plugins: {
        'react-hooks': reactHooks,
      },
      rules: {
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
      },
    },

    ...(vite
      ? [
          {
            name: 'stagegate/react/refresh',
            files: ['src/**/*.{jsx,tsx}'],
            ignores: ['src/**/*.test.tsx', 'src/test/**', 'src/app/router/**'],
            plugins: {
              'react-refresh': reactRefresh,
            },
            rules: {
              'react-refresh/only-export-components': [
                'error',
                {
                  allowConstantExport: true,
                },
              ],
            },
          },
        ]
      : []),

    {
      name: 'stagegate/react/tooling',
      files: ['*.config.{js,mjs,cjs,ts,mts,cts}'],
      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },

    ...(!vite
      ? [
          {
            name: 'stagegate/react/tooling-typescript',
            files: ['*.config.{ts,mts,cts}'],
            extends: [tseslint.configs.disableTypeChecked],
          },
        ]
      : []),
  ]);
