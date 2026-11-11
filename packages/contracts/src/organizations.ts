import z from 'zod';

import {
  IDENTITY_ERROR_CODES,
  identityErrorResponseSchema,
} from './identity.js';

export const organizationIdSchema = z
  .uuid()
  .transform((id) => id.toLowerCase());

export const createOrganizationRequestSchema = z.strictObject({
  id: organizationIdSchema,
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
});

export enum ORGANIZATION_ROLE {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export const organizationRoleSchema = z.enum(ORGANIZATION_ROLE);

export const organizationSummarySchema = createOrganizationRequestSchema.extend(
  {
    role: organizationRoleSchema,
  },
);

const cursorSchema = z.string().min(1).max(160);

export const organizationListQuerySchema = z.strictObject({
  limit: z
    .string()
    .regex(/^(?:[1-9][0-9]?|100)$/)
    .optional()
    .transform((limit) => Number(limit ?? 25)),
  cursor: cursorSchema.optional(),
});

export const organizationListResponseSchema = z.strictObject({
  items: z.array(organizationSummarySchema).max(100),
  nextCursor: cursorSchema.nullable(),
});

export const organizationErrorResponseSchema =
  identityErrorResponseSchema.extend({
    code: z.enum({
      ...IDENTITY_ERROR_CODES,
      ORGANIZATION_SLUG_TAKEN: 'ORGANIZATION_SLUG_TAKEN',
      ORGANIZATION_CREATE_CONFLICT: 'ORGANIZATION_CREATE_CONFLICT',
      ORGANIZATION_NOT_FOUND: 'ORGANIZATION_NOT_FOUND',
    }),
  });

export type CreateOrganizationRequest = z.infer<
  typeof createOrganizationRequestSchema
>;
export type OrganizationSummary = z.infer<typeof organizationSummarySchema>;
export type OrganizationListQuery = z.infer<typeof organizationListQuerySchema>;
export type OrganizationListResponse = z.infer<
  typeof organizationListResponseSchema
>;
