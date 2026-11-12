import { defineConfig } from 'eslint/config';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { createTypeScriptConfig } from './typescript.mjs';

export function createReactConfig({ tsconfigRootDir, typeChecked = true } = {}) {
  return defineConfig([
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

        'jsx-a11y/alt-text': 'error',

        'jsx-a11y/anchor-is-valid': 'error',

        'jsx-a11y/click-events-have-key-events': 'error',

        'jsx-a11y/no-static-element-interactions': 'error',
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

    {
      name: 'stagegate/react/tooling',

      files: ['*.config.{js,mjs,cjs,ts,mts,cts}'],

      languageOptions: {
        globals: {
          ...globals.node,
        },
      },
    },

    {
      name: 'stagegate/react/tooling-typescript',

      files: ['*.config.{ts,mts,cts}'],

      extends: [
        // Configuration files may not belong to the
        // application's TypeScript project.
        // Disable type-aware rules for these files.
        ...getToolingOverrides(),
      ],
    },
  ]);
}

function getToolingOverrides() {
  return [tseslint.configs.disableTypeChecked];
}
