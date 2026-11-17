import { z } from 'zod';

const apiBaseUrlSchema = z
  .string()
  .transform((value) => value.replace(/\/+$/, ''))
  .refine(
    (value) => {
      if (value === '/api/v1') {
        return true;
      }

      try {
        const url = new URL(value);

        return (
          ['http:', 'https:'].includes(url.protocol) &&
          url.username === '' &&
          url.password === '' &&
          url.search === '' &&
          url.hash === '' &&
          url.pathname === '/api/v1'
        );
      } catch {
        return false;
      }
    },
    {
      message: 'API base URL must be /api/v1 or a valid HTTP(S) URL ending in /api/v1.',
    },
  );

const environmentSchema = z
  .object({
    VITE_APP_NAME: z.string().min(1).default('StageGate'),

    VITE_API_BASE_URL: apiBaseUrlSchema,

    VITE_APP_ENV: z.enum(['development', 'test', 'staging', 'production']),

    VITE_ENABLE_QUERY_DEVTOOLS: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
  })
  .superRefine((environment, context) => {
    if (
      environment.VITE_APP_ENV === 'production' &&
      environment.VITE_API_BASE_URL !== '/api/v1' &&
      !environment.VITE_API_BASE_URL.startsWith('https://')
    ) {
      context.addIssue({
        code: 'custom',
        path: ['VITE_API_BASE_URL'],
        message: 'Production API URLs must use HTTPS or same-origin routing.',
      });
    }
  });

export type Environment = z.infer<typeof environmentSchema>;

export const parseEnvironment = (input: unknown): Environment => {
  const result = environmentSchema.safeParse(input);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);

    throw new Error(`Invalid frontend environment:\n${issues.join('\n')}`);
  }

  return result.data;
};
