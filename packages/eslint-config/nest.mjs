import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export function createNestConfig(tsconfigRootDir) {
  return tseslint.config(
    {
      ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
    },
    {
      files: ['src/**/*.ts'],
      ignores: ['**/*.spec.ts'],
      extends: [eslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
      languageOptions: {
        globals: globals.node,
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
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': 'error',
        '@typescript-eslint/no-unnecessary-condition': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
      },
    },
    {
      files: ['test/**/*.ts', '**/*.spec.ts'],
      extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
      languageOptions: {
        globals: {
          ...globals.node,
          ...globals.jest,
        },
        parserOptions: {
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
      },
    },
    eslintConfigPrettier,
  );
}
