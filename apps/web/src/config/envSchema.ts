import { z } from 'zod';

const apiBaseUrlSchema = z.url().refine(
  (value) => {
    const url = URL.parse(value);
    if (url === null) {
      return false;
    }

    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.username === '' &&
      url.password === '' &&
      url.search === '' &&
      url.hash === ''
    );
  },
  {
    message: 'Expected an HTTP(S) API URL without credentials, query or fragment.',
  },
);

export const environmentSchema = z
  .object({
    VITE_APP_NAME: z.string().trim().min(1).default('StageGate'),

    VITE_API_BASE_URL: apiBaseUrlSchema.transform((value) => value.replace(/\/+$/, '')),

    VITE_APP_ENV: z.enum(['development', 'test', 'staging', 'production']),

    VITE_ENABLE_QUERY_DEVTOOLS: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .superRefine((value, context) => {
    if (value.VITE_APP_ENV === 'production' && !value.VITE_API_BASE_URL.startsWith('https://')) {
      context.addIssue({
        code: 'custom',
        path: ['VITE_API_BASE_URL'],
        message: 'Production API URLs must use HTTPS.',
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export function parseEnvironment(input: unknown): Environment {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`Invalid StageGate environment configuration:\n${issues}`);
  }

  return result.data;
}
