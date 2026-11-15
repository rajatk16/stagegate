import { z } from 'zod';

import {
  firebaseEnvironmentSchema,
  validateFirebaseEnvironment,
} from '../../firebase/firebase.environment';

const booleanString = z.enum(['true', 'false']).transform((value) => value === 'true');

const httpOrigin = z.string().refine(
  (value) => {
    try {
      const url = new URL(value);

      return (
        ['http:', 'https:'].includes(url.protocol) &&
        url.username === '' &&
        url.password === '' &&
        url.origin === value
      );
    } catch {
      return false;
    }
  },
  {
    message: 'Expected an HTTP or HTTPS origin without a path.',
  },
);

const corsOrigins = z
  .string()
  .transform((value) => [
    ...new Set(
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0),
    ),
  ])
  .pipe(z.array(httpOrigin).min(1));

const applicationEnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  APP_NAME: z.string().trim().min(1).default('StageGate API'),

  APP_VERSION: z.string().trim().min(1).default('0.0.0'),

  HOST: z.string().trim().min(1).default('0.0.0.0'),

  PORT: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535))
    .default(4000),

  CORS_ORIGINS: corsOrigins,

  CORS_CREDENTIALS: booleanString.default(false),

  HTTP_BODY_LIMIT: z
    .string()
    .regex(/^[1-9]\d*(kb|mb)$/)
    .default('1mb'),

  SWAGGER_ENABLED: booleanString.default(false),
});

export const environmentSchema = applicationEnvironmentSchema
  .extend(firebaseEnvironmentSchema.shape)
  .superRefine((environment, context) => {
    validateFirebaseEnvironment(environment, context);

    if (environment.NODE_ENV !== 'production') {
      return;
    }

    if (environment.CORS_ORIGINS.some((origin) => !origin.startsWith('https://'))) {
      context.addIssue({
        code: 'custom',
        path: ['CORS_ORIGINS'],
        message: 'Production CORS origins must use HTTPS.',
      });
    }

    if (environment.SWAGGER_ENABLED) {
      context.addIssue({
        code: 'custom',
        path: ['SWAGGER_ENABLED'],
        message:
          'Swagger must be disabled in production until protected documentation is implemented.',
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(input: Record<string, unknown>): Environment {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid StageGate API environment configuration:\n${issues}`);
  }

  return result.data;
}
