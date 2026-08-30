import { z } from 'zod';

const environmentSchema = z
  .object({
    VITE_APP_NAME: z.string().trim().min(1).default('StageGate'),
    VITE_APP_ENV: z
      .enum(['local', 'test', 'development', 'staging', 'production'])
      .default('local'),
    VITE_API_BASE_URL: z
      .url('VITE_API_BASE_URL must be a valid URL')
      .transform((value) => value.replace(/\/+$/, '')),
    VITE_FIREBASE_API_KEY: z.string().trim().min(1),
    VITE_FIREBASE_AUTH_DOMAIN: z.string().trim().min(1),
    VITE_FIREBASE_PROJECT_ID: z.string().trim().min(1),
    VITE_FIREBASE_APP_ID: z.string().trim().min(1),
    VITE_FIREBASE_USE_AUTH_EMULATOR: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true'),
    VITE_FIREBASE_AUTH_EMULATOR_URL: z
      .url()
      .refine(
        (value) => {
          const url = new URL(value);
          return (
            url.protocol === 'http:' &&
            ['127.0.0.1', 'localhost'].includes(url.hostname) &&
            url.port === '9099' &&
            url.pathname === '/' &&
            url.search === '' &&
            url.hash === '' &&
            url.username === '' &&
            url.password === ''
          );
        },
        {
          message:
            'Auth Emulator URL must use HTTP on localhost or 127.0.0.1, port 9099, without a path or credentials',
        },
      )
      .transform((value) => new URL(value).origin)
      .default('http://127.0.0.1:9099'),
  })
  .superRefine((values, context) => {
    const isLocalEnvironment = values.VITE_APP_ENV === 'local' || values.VITE_APP_ENV === 'test';

    if (values.VITE_FIREBASE_USE_AUTH_EMULATOR !== isLocalEnvironment) {
      context.addIssue({
        code: 'custom',
        path: ['VITE_FIREBASE_USE_AUTH_EMULATOR'],
        message:
          'Auth Emulator must be enabled for local/test and disabled for development/staging/production',
      });
    }

    if (isLocalEnvironment && values.VITE_FIREBASE_PROJECT_ID !== 'demo-stagegate-local') {
      context.addIssue({
        code: 'custom',
        path: ['VITE_FIREBASE_PROJECT_ID'],
        message: 'Local/test must use the demo-stagegate-local project',
      });
    }

    if (!isLocalEnvironment && values.VITE_FIREBASE_PROJECT_ID.startsWith('demo-')) {
      context.addIssue({
        code: 'custom',
        path: ['VITE_FIREBASE_PROJECT_ID'],
        message: 'Hosted environments must use a real Firebase project',
      });
    }
  });

const result = environmentSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(`Invalid frontend environment:\n${z.prettifyError(result.error)}`);
}

const values = result.data;

export const environment = Object.freeze({
  appName: values.VITE_APP_NAME,
  appEnvironment: values.VITE_APP_ENV,
  apiBaseUrl: values.VITE_API_BASE_URL,
  firebase: Object.freeze({
    config: Object.freeze({
      apiKey: values.VITE_FIREBASE_API_KEY,
      authDomain: values.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: values.VITE_FIREBASE_PROJECT_ID,
      appId: values.VITE_FIREBASE_APP_ID,
    }),
    useAuthEmulator: values.VITE_FIREBASE_USE_AUTH_EMULATOR,
    authEmulatorUrl: values.VITE_FIREBASE_AUTH_EMULATOR_URL,
  }),
});
