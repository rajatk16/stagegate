/**
 * @type {import('prettier').Config}
 */
const config = {
  printWidth: 100,

  tabWidth: 2,

  useTabs: false,

  semi: true,

  singleQuote: true,

  jsxSingleQuote: false,

  trailingComma: 'all',

  bracketSpacing: true,

  bracketSameLine: false,

  arrowParens: 'always',

  endOfLine: 'lf',

  quoteProps: 'as-needed',

  proseWrap: 'preserve',

  htmlWhitespaceSensitivity: 'css',

  embeddedLanguageFormatting: 'auto',

  overrides: [
    {
      files: ['*.json', '*.jsonc'],

      options: {
        tabWidth: 2,
      },
    },

    {
      files: ['*.yaml', '*.yml'],

      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },

    {
      files: ['*.md', '*.mdx'],

      options: {
        proseWrap: 'preserve',
      },
    },
  ],
};

export default config;
