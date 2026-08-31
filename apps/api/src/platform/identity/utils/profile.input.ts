import { z } from 'zod';

import { IdentityError } from './identity.error';
import { type ProfilePatch } from '../types';

const bootstrapSchema = z.object({}).strict();

const patchSchema = z
  .object({
    expectedVersion: z
      .number()
      .int()
      .positive()
      .max(Number.MAX_SAFE_INTEGER - 1),
    displayName: z.string().trim().min(1).max(120).nullable().optional(),
    bio: z.string().trim().min(1).max(2_000).nullable().optional(),
  })
  .strict()
  .refine(
    (value) => value.displayName !== undefined || value.bio !== undefined,
    'At least one profile field is required.',
  );

const parse = <T>(schema: z.ZodType<T>, body: unknown): T => {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw new IdentityError(
      'VALIDATION_FAILED',
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || 'body',
        code: 'INVALID_FIELD',
        message: 'Invalid, missing, or unsupported field.',
      })),
    );
  }

  return result.data;
};

export const validateBootstrapBody = (body: unknown): void => {
  parse(bootstrapSchema, body === undefined ? {} : body);
};

export const parseProfilePatch = (body: unknown): ProfilePatch => parse(patchSchema, body);
