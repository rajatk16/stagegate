import { z } from 'zod';

import { TenancyError } from './tenancy.error';

const createOrganizationSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
  })
  .strict();

const organizationIdSchema = z.string().regex(/^[A-Za-z0-9]{20}$/);

export interface CreateOrganizationInput {
  readonly name: string;
}

const parse = <T>(schema: z.ZodType<T>, value: unknown): T => {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new TenancyError(
      'VALIDATION_ERROR',
      result.error.issues.map((issue) => ({
        path: issue.path.map(String).join('.') || 'body',
        code: 'INVALID_FIELD',
        message: 'Invalid, missing, or unsupported field.',
      })),
    );
  }

  return result.data;
};

export const parseCreateOrganization = (body: unknown): CreateOrganizationInput =>
  parse(createOrganizationSchema, body);

export const parseOrganizationId = (value: unknown): string => parse(organizationIdSchema, value);
