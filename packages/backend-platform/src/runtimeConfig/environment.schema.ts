import { z } from 'zod';

import { ConfigurationValidationError } from './configurationValidation.error';

const emulatorHostSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9.-]+:\d{1,5}$/,
    'must be a host and port without a protocol, for example: 127.0.0.1:8080',
  );

const createEnvironmentSchema = (defaultPort: number): ReturnType<typeof z.object> =>
  z
    .object({
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
      APP_ENV: z.enum(['local', 'test', 'development', 'staging', 'production']).default('local'),
      PORT: z.coerce.number().int().min(1).max(65_535).default(defaultPort),
      FIREBASE_PROJECT_ID: z
        .string()
        .trim()
        .min(6)
        .max(30)
        .regex(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/, 'must be a valid Good Cloud Project ID'),
      FIREBASE_STORAGE_BUCKET: z.string().trim().min(3),
      FIREBASE_AUTH_EMULATOR_HOST: emulatorHostSchema.optional(),
      FIRESTORE_EMULATOR_HOST: emulatorHostSchema.optional(),
      FIREBASE_STORAGE_EMULATOR_HOST: emulatorHostSchema.optional(),
    })
    .passthrough()
    .superRefine((environment, context) => {
      const emulatorHosts = [
        environment.FIREBASE_AUTH_EMULATOR_HOST,
        environment.FIRESTORE_EMULATOR_HOST,
        environment.FIREBASE_STORAGE_EMULATOR_HOST,
      ];

      const configuredEmulators = emulatorHosts.filter(
        (host): host is string => host !== undefined,
      ).length;

      if (configuredEmulators !== 0 && configuredEmulators !== emulatorHosts.length) {
        context.addIssue({
          code: 'custom',
          path: ['FIREBASE_AUTH_EMULATOR_HOST'],
          message: 'all Firebase emulator hosts must be configured together',
        });
      }

      const deployedEnvironment =
        environment.APP_ENV === 'development' ||
        environment.APP_ENV === 'staging' ||
        environment.APP_ENV === 'production';

      if (deployedEnvironment && configuredEmulators > 0) {
        context.addIssue({
          code: 'custom',
          path: ['APP_ENV'],
          message: 'Firebase emulator hosts cannot be configured in a deployed environment',
        });
      }

      if (deployedEnvironment && environment.NODE_ENV !== 'production') {
        context.addIssue({
          code: 'custom',
          path: ['NODE_ENV'],
          message: 'Node environment must be production in a deployed environments',
        });
      }

      if (environment.APP_ENV === 'test' && environment.NODE_ENV !== 'test') {
        context.addIssue({
          code: 'custom',
          path: ['NODE_ENV'],
          message: 'must be test when APP_ENV is test',
        });
      }
    });

export type RuntimeEnvironment = z.output<ReturnType<typeof createEnvironmentSchema>>;

export const validateEnvironment = (
  values: Record<string, unknown>,
  defaultPort: number,
): RuntimeEnvironment => {
  const result = createEnvironmentSchema(defaultPort).safeParse(values);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'environment';
      return `${path}: ${issue.message}`;
    })
    .join(': ');

  throw new ConfigurationValidationError(`Invalid environment configuration: ${issues}`);
};
