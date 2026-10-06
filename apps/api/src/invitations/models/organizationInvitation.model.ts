import z from 'zod';

import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { organizationMembershipSchema } from '../../organizations';

export const INVITABLE_ORGANIZATION_ROLES = {
  ADMIN: ORGANIZATION_ROLES.ADMIN,
  MEMBER: ORGANIZATION_ROLES.MEMBER,
  VIEWER: ORGANIZATION_ROLES.VIEWER,
} as const;

export type INVITABLE_ORGANIZATION_ROLES =
  (typeof INVITABLE_ORGANIZATION_ROLES)[keyof typeof INVITABLE_ORGANIZATION_ROLES];

export const invitationRoleSchema = z.nativeEnum(INVITABLE_ORGANIZATION_ROLES);

export const organizationInvitationSchema = z
  .object({
    id: z.string().uuid(),
    scope: z
      .object({
        type: z.literal('ORGANIZATION'),
        organizationId: z.string().uuid(),
      })
      .strict(),

    recipientEmail: z.string().trim().toLowerCase().email().max(254),
    role: invitationRoleSchema,
    tokenHash: z.string().regex(/^[a-f0-9]{64}$/),
    status: z.enum(['PENDING', 'ACCEPTED', 'REVOKED']),
    createdByUid: organizationMembershipSchema.shape.uid,
    createdAt: z.date(),
    expiresAt: z.date(),

    acceptedByUid: organizationMembershipSchema.shape.uid.nullable(),
    acceptedAt: z.date().nullable(),
    revokedAt: z.date().nullable(),
  })
  .strict();

export type OrganizationInvitation = z.infer<
  typeof organizationInvitationSchema
>;
