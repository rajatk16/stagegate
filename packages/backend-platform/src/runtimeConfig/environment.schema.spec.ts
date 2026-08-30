import { describe, it, expect } from '@jest/globals';
import { validateEnvironment } from './environment.schema';
import { ConfigurationValidationError } from './configurationValidation.error';

const validEnvironment = {
  NODE_ENV: 'test',
  APP_ENV: 'test',
  FIREBASE_PROJECT_ID: 'stagegate-test',
  FIREBASE_STORAGE_BUCKET: 'stagegate-test.firebasestorage.app',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199',
};

describe('ValidateEnvironment', () => {
  it('coerces and returns valid configuration', () => {
    const environment = validateEnvironment(
      {
        ...validEnvironment,
        PORT: '3100',
      },
      3000,
    );

    expect(environment.PORT).toBe(3100);
    expect(environment.APP_ENV).toBe('test');
  });

  it('applies the default port', () => {
    const environment = validateEnvironment(validEnvironment, 3000);
    expect(environment.PORT).toBe(3000);
  });

  it('rejects a missing Firebase project ID', () => {
    const invalidEnvironment: Record<string, unknown> = { ...validEnvironment };
    delete invalidEnvironment.FIREBASE_PROJECT_ID;

    expect(() => validateEnvironment(invalidEnvironment, 3000)).toThrow(
      ConfigurationValidationError,
    );
  });

  it('rejects partially configured emulators', () => {
    expect(() =>
      validateEnvironment(
        {
          ...validEnvironment,
          FIRESTORE_EMULATOR_HOST: undefined,
        },
        3000,
      ),
    ).toThrow('all Firebase emulator hosts must be configured together');
  });

  it('rejects emulator hosts in production', () => {
    expect(() =>
      validateEnvironment(
        {
          ...validEnvironment,
          NODE_ENV: 'production',
          APP_ENV: 'production',
        },
        3000,
      ),
    ).toThrow('Firebase emulator hosts cannot be configured');
  });

  it('does not include invalid values in its error', () => {
    const sensitiveValue = 'do-not-log-this-value';

    try {
      validateEnvironment(
        {
          ...validEnvironment,
          FIREBASE_PROJECT_ID: sensitiveValue,
        },
        3000,
      );

      throw new Error('Expected configuration validation to fail.');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).not.toContain(sensitiveValue);
    }
  });
});
