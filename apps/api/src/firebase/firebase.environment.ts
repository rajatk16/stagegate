import { z } from 'zod';

const projectIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/, 'Invalid Firebase project ID.');

const emulatorHostSchema = z.string().refine(
  (value) => {
    const match = /^(localhost|127\.0\.0\.1|firebase):([0-9]{1,5})$/.exec(value);

    if (!match) {
      return false;
    }

    const port = Number(match[2]);

    return Number.isInteger(port) && port >= 1 && port <= 65535;
  },
  {
    message: 'Emulator host must use an approved local hostname and a valid port.',
  },
);

const healthTimeoutSchema = z
  .string()
  .regex(/^\d+$/)
  .default('2000')
  .transform(Number)
  .pipe(z.number().int().min(100).max(10000));

const healthCacheTtlSchema = z
  .string()
  .regex(/^\d+$/)
  .default('5000')
  .transform(Number)
  .pipe(z.number().int().min(1000).max(60000));

export const firebaseEnvironmentSchema = z.object({
  FIREBASE_MODE: z.enum(['emulator', 'cloud']),
  FIREBASE_PROJECT_ID: projectIdSchema,
  FIRESTORE_EMULATOR_HOST: emulatorHostSchema.optional(),
  FIREBASE_AUTH_EMULATOR_HOST: emulatorHostSchema.optional(),
  FIREBASE_HEALTH_TIMEOUT_MS: healthTimeoutSchema,
  FIREBASE_HEALTH_CACHE_TTL_MS: healthCacheTtlSchema,
});

export type FirebaseEnvironment = z.infer<typeof firebaseEnvironmentSchema>;

interface FirebaseValidationEnvironment extends FirebaseEnvironment {
  NODE_ENV: 'development' | 'test' | 'production';
}

export function validateFirebaseEnvironment(
  environment: FirebaseValidationEnvironment,
  context: z.RefinementCtx,
): void {
  function addIssue(field: keyof FirebaseValidationEnvironment, message: string): void {
    context.addIssue({
      code: 'custom',
      path: [field],
      message,
    });
  }

  if (environment.NODE_ENV === 'production' && environment.FIREBASE_MODE !== 'cloud') {
    addIssue('FIREBASE_MODE', 'Production must use Firebase cloud mode.');
  }

  if (environment.NODE_ENV !== 'production' && environment.FIREBASE_MODE !== 'emulator') {
    addIssue('FIREBASE_MODE', 'Development and test must use Firebase emulator mode.');
  }

  if (environment.FIREBASE_MODE === 'emulator') {
    if (!environment.FIREBASE_PROJECT_ID.startsWith('demo-')) {
      addIssue('FIREBASE_PROJECT_ID', 'Emulator mode requires a demo Firebase project.');
    }

    if (!environment.FIRESTORE_EMULATOR_HOST) {
      addIssue('FIRESTORE_EMULATOR_HOST', 'Firestore emulator host is required.');
    }

    if (!environment.FIREBASE_AUTH_EMULATOR_HOST) {
      addIssue('FIREBASE_AUTH_EMULATOR_HOST', 'Firebase Auth emulator host is required.');
    }

    const firestoreHost = environment.FIRESTORE_EMULATOR_HOST?.split(':')[0];

    const authHost = environment.FIREBASE_AUTH_EMULATOR_HOST?.split(':')[0];

    const usesDocker = firestoreHost === 'firebase' || authHost === 'firebase';

    if (usesDocker && (firestoreHost !== 'firebase' || authHost !== 'firebase')) {
      addIssue(
        'FIRESTORE_EMULATOR_HOST',
        'Docker emulator hosts must use the same approved Firebase service hostname.',
      );
    }

    return;
  }

  if (environment.FIREBASE_PROJECT_ID.startsWith('demo-')) {
    addIssue('FIREBASE_PROJECT_ID', 'Cloud mode requires a real Firebase project.');
  }

  if (environment.FIRESTORE_EMULATOR_HOST !== undefined) {
    addIssue('FIRESTORE_EMULATOR_HOST', 'Firestore emulator host is forbidden in cloud mode.');
  }

  if (environment.FIREBASE_AUTH_EMULATOR_HOST !== undefined) {
    addIssue(
      'FIREBASE_AUTH_EMULATOR_HOST',
      'Firebase Auth emulator host is forbidden in cloud mode.',
    );
  }
}
