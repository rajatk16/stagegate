import { validateEnvironment } from '../../src/config/schemas/env.schema';

const validEnvironment = {
  NODE_ENV: 'development',
  APP_NAME: 'StageGate API',
  APP_VERSION: '0.0.0',
  HOST: '127.0.0.1',
  PORT: '4000',
  CORS_ORIGINS: 'http://localhost:3000',
  CORS_CREDENTIALS: 'false',
  HTTP_BODY_LIMIT: '1mb',
  SWAGGER_ENABLED: 'true',
};

describe('Environment validation', () => {
  it('parses valid environment configuration', () => {
    const result = validateEnvironment(validEnvironment);

    expect(result.PORT).toBe(4000);

    expect(result.CORS_CREDENTIALS).toBe(false);

    expect(result.SWAGGER_ENABLED).toBe(true);
  });

  it('applies safe defaults', () => {
    const result = validateEnvironment({
      CORS_ORIGINS: 'http://localhost:3000',
    });

    expect(result.PORT).toBe(4000);
    expect(result.SWAGGER_ENABLED).toBe(false);
    expect(result.HTTP_BODY_LIMIT).toBe('1mb');
  });

  it('parses multiple CORS origins', () => {
    const result = validateEnvironment({
      ...validEnvironment,

      CORS_ORIGINS: 'http://localhost:3000, https://app.example.com',
    });

    expect(result.CORS_ORIGINS).toEqual(['http://localhost:3000', 'https://app.example.com']);
  });

  it('deduplicates CORS origins', () => {
    const result = validateEnvironment({
      ...validEnvironment,

      CORS_ORIGINS: 'http://localhost:3000,http://localhost:3000',
    });

    expect(result.CORS_ORIGINS).toEqual(['http://localhost:3000']);
  });

  it.each(['0', '65536', '-1', 'abc', '4.5'])('rejects invalid port %s', (port) => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        PORT: port,
      }),
    ).toThrow('Invalid StageGate API environment configuration');
  });

  it('rejects wildcard CORS origins', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        CORS_ORIGINS: '*',
      }),
    ).toThrow();
  });

  it('rejects CORS origins containing paths', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,

        CORS_ORIGINS: 'https://app.example.com/path',
      }),
    ).toThrow();
  });

  it('rejects missing CORS origins', () => {
    expect(() =>
      validateEnvironment({
        CORS_ORIGINS: '',
      }),
    ).toThrow();
  });

  it('rejects invalid boolean values', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        SWAGGER_ENABLED: 'yes',
      }),
    ).toThrow();
  });

  it('rejects invalid request body limits', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        HTTP_BODY_LIMIT: 'unlimited',
      }),
    ).toThrow();
  });

  it('rejects HTTP origins in production', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',
        SWAGGER_ENABLED: 'false',
      }),
    ).toThrow('Production CORS origins must use HTTPS');
  });

  it('rejects enabled Swagger in production', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        NODE_ENV: 'production',

        CORS_ORIGINS: 'https://app.example.com',
      }),
    ).toThrow('Swagger must be disabled in production');
  });

  it('accepts valid production configuration', () => {
    const result = validateEnvironment({
      ...validEnvironment,
      NODE_ENV: 'production',

      CORS_ORIGINS: 'https://app.example.com',

      SWAGGER_ENABLED: 'false',
    });

    expect(result.NODE_ENV).toBe('production');

    expect(result.SWAGGER_ENABLED).toBe(false);
  });
});
