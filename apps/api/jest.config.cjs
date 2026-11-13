/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',

  displayName: 'stagegate-api-unit',

  rootDir: '.',

  testEnvironment: 'node',

  testMatch: ['<rootDir>/test/unit/**/*.spec.ts'],

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

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.interface.ts',
  ],

  coverageDirectory: '<rootDir>/coverage',

  coverageReporters: ['text', 'html', 'lcov'],
};
