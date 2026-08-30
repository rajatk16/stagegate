/** @type {import('jest').Config} */
module.exports = {
  displayName: 'backend-platform-unit',
  rootDir: '.',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  clearMocks: true,
  resetMocks: true,
  coverageDirectory: '<rootDir>/coverage/unit',
};
