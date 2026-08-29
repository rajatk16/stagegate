import { z } from 'zod';

const environmentSchema = z.object({
  VITE_APP_NAME: z.string().trim().min(1).default('StageGate'),
  VITE_APP_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  VITE_API_BASE_URL: z
    .url('VITE_API_BASE_URL must be a valid URL')
    .transform((value) => value.replace(/\/+$/, '')),
});

const result = environmentSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error(`Invalid frontend environment:\n${z.prettifyError(result.error)}`);
}

export const environment = Object.freeze({
  appName: result.data.VITE_APP_NAME,
  appEnvironment: result.data.VITE_APP_ENV,
  apiBaseUrl: result.data.VITE_API_BASE_URL,
});
