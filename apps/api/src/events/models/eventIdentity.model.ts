import z from 'zod';

import { eventObjectSchema } from './event.model';
import { organizationSchema } from '../../organizations/models/organization.model';
import { organizationMembershipSchema } from '../../organizations/models/organizationMembership.model';

export const eventIdentitySchema = z.object({
  actorUid: organizationMembershipSchema.shape.uid,
  organizationId: organizationSchema.shape.id,
  eventId: eventObjectSchema.shape.id,
});

export type EventIdentity = z.infer<typeof eventIdentitySchema>;
