import z from 'zod';

export const instantSchema = z
  .date()
  .refine(
    (value) => value.getUTCFullYear() >= 1 && value.getUTCFullYear() <= 9_999,
    'Timestamp is outside the supported storage range.',
  );

export const apiInstantSchema = z
  .string()
  .datetime({ offset: true })
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/,
    'Use a timezone and at most three fractional-second digits.',
  )
  .transform((value) => new Date(value))
  .pipe(instantSchema);
