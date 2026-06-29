import z from 'zod';

const slugRegex = /^[a-z0-9-]+$/;

export const optionalSlug = () =>
  z
    .union([
      z.literal(''),
      z
        .string()
        .trim()
        .min(3)
        .max(64)
        .regex(
          slugRegex,
          'Slug must contain only lowercase letters, numbers, and hyphens.',
        ),
    ])
    .optional();
