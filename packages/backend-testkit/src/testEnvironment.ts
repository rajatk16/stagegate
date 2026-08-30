export const TEST_ENVIRONMENT = Object.freeze({
  NODE_ENV: 'test',
  APP_ENV: 'test',
  FIREBASE_PROJECT_ID: 'stagegate-test',
  FIREBASE_STORAGE_BUCKET: 'stagegate-test.firebasestorage.app',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
});

export type TestEnvironmentOverride = Partial<typeof TEST_ENVIRONMENT>;

export function installTestEnvironment(overrides: TestEnvironmentOverride = {}): void {
  const environment = {
    ...TEST_ENVIRONMENT,
    ...overrides,
  };

  for (const [name, value] of Object.entries(environment)) {
    process.env[name] ??= value;
  }
}
