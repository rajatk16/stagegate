import z from 'zod';

import { EVENT_ROLES } from '../../events/enums';
import {
  type OrganizationInvitation,
  organizationInvitationSchema,
} from './organizationInvitation.model';

export const eventInvitationSchema = organizationInvitationSchema
  .extend({
    scope: z
      .object({
        type: z.literal('EVENT'),
        organizationId: z.string().uuid(),
        eventId: z.string().uuid(),
      })
      .strict(),
    role: z.nativeEnum(EVENT_ROLES),
  })
  .strict();

export const invitationSchema = z.union([
  organizationInvitationSchema,
  eventInvitationSchema,
]);

export type EventInvitation = z.infer<typeof eventInvitationSchema>;

export type Invitation = z.infer<typeof invitationSchema>;

export const isEventInvitation = (
  invitation: Invitation,
): invitation is EventInvitation => invitation.scope.type === 'EVENT';

export const isOrganizationInvitation = (
  invitation: Invitation,
): invitation is OrganizationInvitation =>
  invitation.scope.type === 'ORGANIZATION';
