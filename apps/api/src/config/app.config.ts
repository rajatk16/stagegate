import { registerAs } from '@nestjs/config';

import { getAllowedAuthProviders, getCorsOrigins } from './env.validation';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT ?? 3000),
  corsOrigins: getCorsOrigins(process.env.CORS_ORIGIN),

  swaggerEnabled: process.env.SWAGGER_ENABLED === 'true',

  rateLimit: {
    ttlMs: Number(process.env.RATE_LIMIT_TTL ?? 60) * 1_000,
    limit: Number(process.env.RATE_LIMIT_LIMIT ?? 100),
  },

  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15_000),
  headersTimeoutMs: Number(process.env.HEADERS_TIMEOUT_MS ?? 20_000),
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  allowedProviders: getAllowedAuthProviders(
    process.env.AUTH_ALLOWED_PROVIDERS ?? 'google.com',
  ),
}));
