/** @type {import('jest').Config} */
module.exports = {
  displayName: 'worker-integration',
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/**/*.integration-spec.ts'],
  setupFiles: ['<rootDir>/test/setup-environment.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  clearMocks: true,
  restoreMocks: true,
  maxWorkers: 1,
  testTimeout: 15_000,
};
