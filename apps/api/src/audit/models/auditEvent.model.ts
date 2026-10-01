import { z } from 'zod';

import { PROFILE_FIELDS } from '../enums';

const auditBaseSchema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string().uuid(),
  outcome: z.literal('succeeded'),
  actorUid: z.string().min(1).max(128),
  requestId: z.string().uuid(),
  occurredAt: z.date(),
});

export const profileUpdatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('user.profile.updated'),
    targetType: z.literal('user'),
    targetUid: z.string().min(1).max(128),
    fields: z.array(z.enum(PROFILE_FIELDS)).min(1).max(5),
  })
  .strict();

export const organizationCreatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.created'),
    targetType: z.literal('organization'),
    targetId: z.string().uuid(),
  })
  .strict();

export const auditEventSchema = z.discriminatedUnion('action', [
  profileUpdatedAuditEventSchema,
  organizationCreatedAuditEventSchema,
]);

export type AuditEvent = z.infer<typeof auditEventSchema>;
