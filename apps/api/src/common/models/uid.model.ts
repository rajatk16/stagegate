import z from 'zod';

export const uidSchema = z
  .string()
  .min(1)
  .max(128)
  .refine(
    (value) =>
      !value.includes('/') &&
      value !== '.' &&
      value !== '..' &&
      !/^__.*__$/.test(value),
  );
