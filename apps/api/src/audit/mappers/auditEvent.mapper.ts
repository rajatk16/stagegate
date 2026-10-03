import { randomUUID } from 'node:crypto';

import { AuditEvent, auditEventSchema } from '../models';
import { ORGANIZATION_SETTINGS_FIELDS, ProfileField } from '../enums';

interface ProfileUpdatedEventInput {
  actorUid: string;
  targetUid: string;
  requestId: string;
  fields: readonly ProfileField[];
}

interface OrganizationCreatedEventInput {
  actorUid: string;
  organizationId: string;
  requestId: string;
  occurredAt: Date;
}

export const toProfileUpdatedAuditEvent = (
  input: ProfileUpdatedEventInput,
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

    fields: [...new Set(input.fields)],
  });

export const toOrganizationCreatedAuditEvent = (
  input: OrganizationCreatedEventInput,
): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'organization.created',
    outcome: 'succeeded',

    actorUid: input.actorUid,
    targetType: 'organization',
    targetId: input.organizationId,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });

export const toOrganizationSettingsUpdatedAuditEvent = (input: {
  actorUid: string;
  organizationId: string;
  requestId: string;
  occurredAt: Date;
  fields: readonly ORGANIZATION_SETTINGS_FIELDS[];
}): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'organization.settings.updated',
    outcome: 'succeeded',

    actorUid: input.actorUid,
    targetType: 'organization',
    targetId: input.organizationId,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
    fields: [...new Set(input.fields)],
  });
