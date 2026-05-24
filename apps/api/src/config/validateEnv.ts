import { z } from 'zod';
import { envSchema } from './env.schema';

export const validateEnv = (config: Record<string, unknown>) => {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      z.flattenError(parsed.error).fieldErrors,
    );
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};
