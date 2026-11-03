import z from 'zod';

import { uidSchema } from '../../common/models/uid.model';
import { ORGANIZATION_MEMBERSHIP_STATUS } from '../enums/organizationMembershipStatus.enum';
import { ORGANIZATION_ROLES } from '../enums/organizationRoles.enum';

export const organizationMembershipSchema = z
  .object({
    organizationId: z.string().uuid(),
    uid: uidSchema,
    role: z.nativeEnum(ORGANIZATION_ROLES),
    status: z
      .nativeEnum(ORGANIZATION_MEMBERSHIP_STATUS)
      .default(ORGANIZATION_MEMBERSHIP_STATUS.ACTIVE),
    membershipId: z.string().uuid().nullable().default(null),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export type OrganizationMembership = z.infer<
  typeof organizationMembershipSchema
>;
