const baseConfig = require('./jest.e2e.config.cjs');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,

  displayName: 'stagegate-firebase-integration',

  testMatch: ['<rootDir>/test/infrastructure/**/*.integration-spec.ts'],

  testTimeout: 30000,

  maxWorkers: 1,
};
