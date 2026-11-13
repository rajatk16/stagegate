import { describe, expect, it } from 'vitest';

import { parseEnvironment } from '@/config/envSchema';

const validEnvironment = {
  VITE_APP_NAME: 'StageGate',
  VITE_API_BASE_URL: 'http://localhost:4000/api/v1',
  VITE_APP_ENV: 'development',
  VITE_ENABLE_QUERY_DEVTOOLS: 'true',
};

describe('environment configuration', () => {
  it('parses valid environment variables', () => {
    const environment = parseEnvironment(validEnvironment);

    expect(environment.VITE_APP_NAME).toBe('StageGate');
    expect(environment.VITE_ENABLE_QUERY_DEVTOOLS).toBe(true);
  });

  it('normalizes trailing API URL slashes', () => {
    const environment = parseEnvironment({
      ...validEnvironment,
      VITE_API_BASE_URL: 'http://localhost:4000/api/v1///',
    });

    expect(environment.VITE_API_BASE_URL).toBe('http://localhost:4000/api/v1');
  });

  it('rejects invalid API URLs', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_API_BASE_URL: 'invalid-url',
      }),
    ).toThrow('Invalid StageGate environment configuration');
  });

  it('rejects unsupported URL protocols', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_API_BASE_URL: 'ftp://example.com',
      }),
    ).toThrow();
  });

  it('rejects unknown application environments', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_APP_ENV: 'unknown',
      }),
    ).toThrow();
  });

  it('rejects invalid boolean strings', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_ENABLE_QUERY_DEVTOOLS: 'yes',
      }),
    ).toThrow();
  });

  it('requires HTTPS in production', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_APP_ENV: 'production',
      }),
    ).toThrow('Production API URLs must use HTTPS');
  });

  it('accepts HTTPS in production', () => {
    const environment = parseEnvironment({
      ...validEnvironment,
      VITE_APP_ENV: 'production',
      VITE_API_BASE_URL: 'https://api.example.com/api/v1',
    });

    expect(environment.VITE_APP_ENV).toBe('production');
  });

  it('rejects URLs containing credentials', () => {
    expect(() =>
      parseEnvironment({
        ...validEnvironment,
        VITE_API_BASE_URL: 'https://user:password@example.com',
      }),
    ).toThrow();
  });

  it('defaults query devtools to disabled', () => {
    const environment = parseEnvironment({
      VITE_API_BASE_URL: 'http://localhost:4000/api/v1',
      VITE_APP_ENV: 'development',
    });

    expect(environment.VITE_ENABLE_QUERY_DEVTOOLS).toBe(false);
  });
});
