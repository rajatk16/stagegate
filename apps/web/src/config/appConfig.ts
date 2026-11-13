import { env } from './env';

export const appConfig = {
  name: env.VITE_APP_NAME,
  description: 'From Call for Papers to Conference Stage',
  environment: env.VITE_APP_ENV,

  api: {
    baseUrl: env.VITE_API_BASE_URL,
    timeoutMs: 15_000,
  },
  features: {
    queryDevtools: import.meta.env.DEV && env.VITE_ENABLE_QUERY_DEVTOOLS,
  },
};
