import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api'),
  FIREBASE_PROJECT_ID: z.string(),
  FIREBASE_CLIENT_EMAIL: z.string(),
  FIREBASE_PRIVATE_KEY: z.string(),
  JWT_SECRET: z.string().min(32),
});

export type EnvSchema = z.infer<typeof envSchema>;
