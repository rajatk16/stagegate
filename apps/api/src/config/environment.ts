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

export const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  FRONTEND_ORIGIN: z.string().refine(isHttpOrigin, {
    message: 'Must be an HTTP(S) origin, without a trailing slash or path'
  })
});

export type Environment = z.infer<typeof environmentSchema>;
