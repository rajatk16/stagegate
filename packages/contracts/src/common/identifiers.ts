import z from 'zod';

export const resourceIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invalid resource identifier.');

export const uuidSchema = z.uuid();

export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'Slug must contain lowercase letters, numbers and single hyphens',
  );

export const timestampSchema = z.iso.datetime({
  offset: true,
});

export const requestIdSchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9._-]+$/);

export type ResourceId = z.infer<typeof resourceIdSchema>;

export type UUID = z.infer<typeof uuidSchema>;

export type Slug = z.infer<typeof slugSchema>;

export type Timestamp = z.infer<typeof timestampSchema>;

export type RequestId = z.infer<typeof requestIdSchema>;
