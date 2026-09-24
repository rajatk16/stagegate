import { z } from 'zod';

import { PROFILE_FIELDS } from '../enums';

export const auditEventSchema = z.object({
  schemaVersion: z.literal(1),
  eventId: z.string().uuid(),
  action: z.literal('user.profile.updated'),
  outcome: z.literal('succeeded'),

  actorUid: z.string().min(1).max(128),
  targetType: z.literal('user'),
  targetUid: z.string().min(1).max(128),

  requestId: z.string().uuid(),
  occurredAt: z.date(),

  fields: z.array(z.enum(PROFILE_FIELDS)).min(1).max(5),
}).strict();

export type AuditEvent = z.infer<typeof auditEventSchema>;