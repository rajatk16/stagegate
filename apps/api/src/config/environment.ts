import z from "zod";

const isHttpOrigin = (value: string): boolean => {
  try {
    const url = new URL(value);

    return (
      (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === value
    );
  } catch {
    return false;
  }
}

const isLocalEmulatorHost = (value: string): boolean => {
  const match = /^(127\.0\.0\.1|localhost):([0-9]{1,5})$/.exec(value);

  if (!match) return false;

  const port = Number(match[2]);
  return port >= 1 && port <= 65_535;
}

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  FRONTEND_ORIGIN: z.string().refine(isHttpOrigin, {
    message: 'Must be an HTTP(S) origin, without a trailing slash or path'
  }),
  FIREBASE_MODE: z.enum(['emulator', 'live']),
  FIREBASE_PROJECT_ID: z.string().min(6).max(30).regex(/^[a-z][a-z0-9-]*[a-z0-9]$/, {
    message: 'Must be a valid Firebase project ID'
  }),
  FIRESTORE_EMULATOR_HOST: z.string().refine(isLocalEmulatorHost, {
    message: "Must be localhost:PORT or 127.0.0.1:PORT"
  }).optional()
}).superRefine((env, context) => {
  const issue = (field: string, message: string) => {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: [field],
      message
    })
  }

  if (env.NODE_ENV === 'production') {
    if (env.FIREBASE_MODE !== 'live') {
      issue('FIREBASE_MODE', 'Production requires live mode');
    }

    if (env.FIREBASE_PROJECT_ID.startsWith('demo-')) {
      issue('FIREBASE_PROJECT_ID', 'Production cannot use a demo project');
    }

    if (env.FIRESTORE_EMULATOR_HOST !== undefined) {
      issue(
        'FIRESTORE_EMULATOR_HOST',
        'Must be absent in production',
      );
    }

    return;
  }

  if (env.FIREBASE_MODE !== 'emulator') {
    issue(
      'FIREBASE_MODE',
      'Development and test environments require emulator mode',
    );
  }

  if (!env.FIREBASE_PROJECT_ID.startsWith('demo-')) {
    issue(
      'FIREBASE_PROJECT_ID',
      'Development and test environments require a demo- project',
    );
  }

  if (!env.FIRESTORE_EMULATOR_HOST) {
    issue(
      'FIRESTORE_EMULATOR_HOST',
      'Required when using the emulator',
    );
  }
})

export type Environment = z.infer<typeof environmentSchema>;

export const validateEnvironment = (raw: Record<string, unknown>): Environment => {
  if (raw.NODE_ENV === 'production') {
    const emulatorKeys = Object.keys(raw).filter(
      (key) => key.includes('EMULATOR') && raw[key] !== undefined,
    );

    if (emulatorKeys.length > 0) {
      throw new Error(
        `Production forbids emulator configuration: ${emulatorKeys.join(', ')}`,
      );
    }
  }

  const result = environmentSchema.safeParse(raw);

  if (!result.success) {
    const messages = result.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );

    throw new Error(`Invalid environment:\n${messages.join('\n')}`);
  }

  return result.data;
}
