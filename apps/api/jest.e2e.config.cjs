/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',

  displayName: 'stagegate-api-integration',

  rootDir: '.',

  testEnvironment: 'node',

  testMatch: ['<rootDir>/test/**/*.e2e.spec.ts'],

  setupFiles: ['<rootDir>/test/setupEnv.ts'],

  moduleFileExtensions: ['ts', 'js', 'json'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        useESM: true,
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  clearMocks: true,

  restoreMocks: true,

  testTimeout: 15000,
};
