import { validateEnvironment } from '../../src/config/schemas/env.schema';

const emulatorEnvironment = {
  NODE_ENV: 'development',

  CORS_ORIGINS: 'http://localhost:3000',

  FIREBASE_MODE: 'emulator',

  FIREBASE_PROJECT_ID: 'demo-stagegate',

  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',

  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
};

const cloudEnvironment = {
  NODE_ENV: 'production',

  CORS_ORIGINS: 'https://app.example.com',

  FIREBASE_MODE: 'cloud',

  FIREBASE_PROJECT_ID: 'stagegate-production',

  SWAGGER_ENABLED: 'false',
};

describe('Firebase environment validation', () => {
  it('accepts valid emulator configuration', () => {
    const result = validateEnvironment(emulatorEnvironment);

    expect(result.FIREBASE_MODE).toBe('emulator');

    expect(result.FIREBASE_PROJECT_ID).toBe('demo-stagegate');
  });

  it('accepts valid cloud configuration', () => {
    const result = validateEnvironment(cloudEnvironment);

    expect(result.FIREBASE_MODE).toBe('cloud');
  });

  it('applies health check defaults', () => {
    const result = validateEnvironment(emulatorEnvironment);

    expect(result.FIREBASE_HEALTH_TIMEOUT_MS).toBe(2000);

    expect(result.FIREBASE_HEALTH_CACHE_TTL_MS).toBe(5000);
  });

  it('rejects emulator mode in production', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        NODE_ENV: 'production',

        CORS_ORIGINS: 'https://app.example.com',
      }),
    ).toThrow('Firebase emulator mode is forbidden in production');
  });

  it('rejects cloud mode in development', () => {
    expect(() =>
      validateEnvironment({
        ...cloudEnvironment,
        NODE_ENV: 'development',
      }),
    ).toThrow('Development and test environments must use Firebase emulators');
  });

  it('rejects cloud mode in tests', () => {
    expect(() =>
      validateEnvironment({
        ...cloudEnvironment,
        NODE_ENV: 'test',
      }),
    ).toThrow();
  });

  it('rejects real projects in emulator mode', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIREBASE_PROJECT_ID: 'stagegate-production',
      }),
    ).toThrow('Emulator mode requires a demo Firebase project');
  });

  it('rejects demo projects in cloud mode', () => {
    expect(() =>
      validateEnvironment({
        ...cloudEnvironment,

        FIREBASE_PROJECT_ID: 'demo-stagegate',
      }),
    ).toThrow('Cloud mode requires a real Firebase project');
  });

  it('requires a Firestore emulator host', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIRESTORE_EMULATOR_HOST: undefined,
      }),
    ).toThrow('Firestore emulator host is required');
  });

  it('requires an Auth emulator host', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIREBASE_AUTH_EMULATOR_HOST: undefined,
      }),
    ).toThrow('Firebase Auth emulator host is required');
  });

  it.each([
    'http://127.0.0.1:8080',
    'https://localhost:8080',
    'example.com:8080',
    '192.168.1.1:8080',
    'localhost:65536',
    'localhost:0',
    'localhost',
  ])('rejects invalid emulator host %s', (host) => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIRESTORE_EMULATOR_HOST: host,
      }),
    ).toThrow();
  });

  it('rejects Firestore emulator variables in cloud mode', () => {
    expect(() =>
      validateEnvironment({
        ...cloudEnvironment,

        FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      }),
    ).toThrow('Firestore emulator host is forbidden in cloud mode');
  });

  it('rejects Auth emulator variables in cloud mode', () => {
    expect(() =>
      validateEnvironment({
        ...cloudEnvironment,

        FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      }),
    ).toThrow('Firebase Auth emulator host is forbidden in cloud mode');
  });

  it('rejects invalid health timeout values', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIREBASE_HEALTH_TIMEOUT_MS: '0',
      }),
    ).toThrow();
  });

  it('rejects invalid health cache values', () => {
    expect(() =>
      validateEnvironment({
        ...emulatorEnvironment,

        FIREBASE_HEALTH_CACHE_TTL_MS: 'abc',
      }),
    ).toThrow();
  });
});
