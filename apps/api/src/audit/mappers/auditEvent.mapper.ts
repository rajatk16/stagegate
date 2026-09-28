import { randomUUID } from "node:crypto";

import { ProfileField } from "../enums";
import { AuditEvent, auditEventSchema } from "../models";

interface ProfileUpdatedEventInput {
  actorUid: string;
  targetUid: string;
  requestId: string;
  fields: readonly ProfileField[];
}

export const toProfileUpdatedAuditEvent = (
  input: ProfileUpdatedEventInput
): AuditEvent => 
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'user.profile.updated',
    outcome: 'succeeded',

    actorUid: input.actorUid,
    targetType: 'user',
    targetUid: input.targetUid,

    requestId: input.requestId,
    occurredAt: new Date(),

    fields: [...new Set(input.fields)]
  });
