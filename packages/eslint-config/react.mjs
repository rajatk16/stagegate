import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export function createReactConfig(tsconfigRootDir) {
  return defineConfig([
    globalIgnores(['dist/**', 'coverage/**', 'node_modules/**']),
    {
      files: ['src/**/*.{ts,tsx}', 'vite.config.ts'],
      extends: [
        eslint.configs.recommended,
        tseslint.configs.strictTypeChecked,
        tseslint.configs.stylisticTypeChecked,
        reactHooks.configs.flat.recommended,
        reactRefresh.configs.vite,
      ],
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node,
        },
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    eslintConfigPrettier,
  ]);
}
