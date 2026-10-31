import z from 'zod';

import { EVENT_ROLES } from '../enums';
import { organizationMembershipSchema } from '../../organizations/models';

export const eventMembershipSchema = z
  .object({
    organizationId: z.string().uuid(),
    eventId: z.string().uuid(),
    uid: organizationMembershipSchema.shape.uid,
    role: z.nativeEnum(EVENT_ROLES),
    status: z.enum(['ACTIVE', 'SUSPENDED']),
    organizationMembershipKey: z
      .string()
      .min(1)
      .max(128)
      .nullable()
      .default(null),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

export type EventMembership = z.infer<typeof eventMembershipSchema>;
