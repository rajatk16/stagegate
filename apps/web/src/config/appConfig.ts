import { env } from './env';

export const resolveApiBaseUrl = (baseUrl: string, origin: string): string => {
  if (baseUrl === '/api/v1') {
    return new URL(baseUrl, origin).toString();
  }
  return baseUrl;
};

export const appConfig = {
  name: env.VITE_APP_NAME,
  description: 'From Call for Papers to Conference Stage',
  environment: env.VITE_APP_ENV,
  api: {
    baseUrl: resolveApiBaseUrl(env.VITE_API_BASE_URL, window.location.origin),
    timeoutMs: 15_000,
  },
  queryDevtools: import.meta.env.DEV && env.VITE_ENABLE_QUERY_DEVTOOLS,
};
