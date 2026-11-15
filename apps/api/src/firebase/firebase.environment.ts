import { z } from 'zod';

const emulatorHostSchema = z
  .string()
  .regex(/^(localhost|127\.0\.0\.1):[1-9]\d{0,4}$/, 'Expected a loopback emulator host and port.')
  .refine((value) => {
    const port = Number(value.split(':')[1]);

    return port >= 1 && port <= 65535;
  }, 'Emulator port must be between 1 and 65535.');

const positiveIntegerString = (minimum: number, maximum: number) =>
  z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(minimum).max(maximum));

export const firebaseEnvironmentSchema = z.object({
  FIREBASE_MODE: z.enum(['emulator', 'cloud']),

  FIREBASE_PROJECT_ID: z
    .string()
    .regex(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/, 'Invalid Firebase project ID.'),

  FIRESTORE_EMULATOR_HOST: emulatorHostSchema.optional(),

  FIREBASE_AUTH_EMULATOR_HOST: emulatorHostSchema.optional(),

  FIREBASE_HEALTH_TIMEOUT_MS: positiveIntegerString(100, 10000).default(2000),

  FIREBASE_HEALTH_CACHE_TTL_MS: positiveIntegerString(1000, 60000).default(5000),
});

export type FirebaseEnvironment = z.infer<typeof firebaseEnvironmentSchema>;

type RuntimeEnvironment = 'development' | 'test' | 'production';

export type FirebaseRuntimeEnvironment = FirebaseEnvironment & {
  NODE_ENV: RuntimeEnvironment;
};

export function validateFirebaseEnvironment(
  environment: FirebaseRuntimeEnvironment,
  context: z.RefinementCtx,
): void {
  const isEmulator = environment.FIREBASE_MODE === 'emulator';

  const isDemoProject = environment.FIREBASE_PROJECT_ID.startsWith('demo-');

  const isProduction = environment.NODE_ENV === 'production';

  if (isProduction && isEmulator) {
    context.addIssue({
      code: 'custom',
      path: ['FIREBASE_MODE'],
      message: 'Firebase emulator mode is forbidden in production.',
    });
  }

  if (!isProduction && !isEmulator) {
    context.addIssue({
      code: 'custom',
      path: ['FIREBASE_MODE'],
      message: 'Development and test environments must use Firebase emulators.',
    });
  }

  if (isEmulator) {
    if (!isDemoProject) {
      context.addIssue({
        code: 'custom',
        path: ['FIREBASE_PROJECT_ID'],
        message: 'Emulator mode requires a demo Firebase project.',
      });
    }

    if (!environment.FIRESTORE_EMULATOR_HOST) {
      context.addIssue({
        code: 'custom',
        path: ['FIRESTORE_EMULATOR_HOST'],
        message: 'Firestore emulator host is required.',
      });
    }

    if (!environment.FIREBASE_AUTH_EMULATOR_HOST) {
      context.addIssue({
        code: 'custom',
        path: ['FIREBASE_AUTH_EMULATOR_HOST'],
        message: 'Firebase Auth emulator host is required.',
      });
    }

    return;
  }

  if (isDemoProject) {
    context.addIssue({
      code: 'custom',
      path: ['FIREBASE_PROJECT_ID'],
      message: 'Cloud mode requires a real Firebase project.',
    });
  }

  if (environment.FIRESTORE_EMULATOR_HOST !== undefined) {
    context.addIssue({
      code: 'custom',
      path: ['FIRESTORE_EMULATOR_HOST'],
      message: 'Firestore emulator host is forbidden in cloud mode.',
    });
  }

  if (environment.FIREBASE_AUTH_EMULATOR_HOST !== undefined) {
    context.addIssue({
      code: 'custom',
      path: ['FIREBASE_AUTH_EMULATOR_HOST'],
      message: 'Firebase Auth emulator host is forbidden in cloud mode.',
    });
  }
}
