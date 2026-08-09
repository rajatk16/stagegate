import { z } from 'zod';

const booleanFromEnvironment = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true');

const corsOrigins = z.string().transform((value) =>
  value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const environmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'testing', 'staging', 'production']),
    PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
    CORS_ORIGIN: z.string().optional(),
    LOG_LEVEL: z
      .enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal'])
      .default('info'),
    FIREBASE_PROJECT_ID: z.string(),
    FIREBASE_CLIENT_EMAIL: z.email(),
    FIREBASE_PRIVATE_KEY: z.string(),
    SWAGGER_ENABLED: booleanFromEnvironment.default(false),
    RATE_LIMIT_TTL: z.coerce.number().int().min(1).default(60),
    RATE_LIMIT_LIMIT: z.coerce.number().int().min(1).max(10_000).default(100),
    REQUEST_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(30_000)
      .default(15_000),
    HEADERS_TIMEOUT_MS: z.coerce
      .number()
      .int()
      .min(1_000)
      .max(30_000)
      .default(20_000),
    TRUST_PROXY: z.coerce.number().int().min(0).max(5).default(0),
    AUTH_ALLOWED_PROVIDERS: z.string().min(1).default('google.com'),
  })
  .loose()
  .superRefine((environment, context) => {
    if (environment.NODE_ENV === 'production') {
      if (!environment.CORS_ORIGIN) {
        context.addIssue({
          code: 'custom',
          path: ['CORS_ORIGIN'],
          message: 'CORS_ORIGIN is required in production',
        });
      }

      if (environment.CORS_ORIGIN?.includes('*')) {
        context.addIssue({
          code: 'custom',
          path: ['CORS_ORIGIN'],
          message: 'Wildcard CORS origins are forbidden in production',
        });
      }
    }

    if (environment.NODE_ENV === 'production' && environment.SWAGGER_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['SWAGGER_ENABLED'],
        message: 'Swagger is not enabled in production',
      });
    }
  });

export type EnvironmentConfig = z.infer<typeof environmentSchema>;

export const validateEnvironment = (
  environment: Record<string, unknown>,
): EnvironmentConfig => {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    const invalidKeys = result.error.issues
      .map((issue) => issue.path.join('.'))
      .filter(Boolean)
      .join(', ');

    throw new Error(`Invalid environment configuration: ${invalidKeys}`);
  }

  return result.data;
};

export const getCorsOrigins = (corsOrigin?: string): string[] => {
  if (!corsOrigin) return [];

  return corsOrigins.parse(corsOrigin);
};

export const getAllowedAuthProviders = (value: string): string[] =>
  value
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean);
