import { randomUUID } from 'node:crypto';

import { ORGANIZATION_SETTINGS_FIELDS } from '../enums';
import { AuditEvent, auditEventSchema } from '../models';
import { ORGANIZATION_ROLES } from '../../organizations/enums';
import {
  ProfileUpdatedEventInput,
  OrganizationCreatedEventInput,
  OwnershipTransferredAuditInput,
  OrganizationInvitationAuditInput,
} from '../types';

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

export const toOrganizationMemberRoleChangedAuditEvent = (input: {
  actorUid: string;
  organizationId: string;
  targetUid: string;
  previousRole: ORGANIZATION_ROLES;
  nextRole: ORGANIZATION_ROLES;
  requestId: string;
  occurredAt: Date;
}): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'organization.member.role.changed',
    outcome: 'succeeded',
    targetType: 'organizationMembership',

    actorUid: input.actorUid,
    organizationId: input.organizationId,
    targetUid: input.targetUid,
    previousRole: input.previousRole,
    nextRole: input.nextRole,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });

export const toOrganizationInvitationAuditEvent = (
  input: OrganizationInvitationAuditInput & {
    requestId: string;
  },
): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: input.action,
    outcome: 'succeeded',
    targetType: 'organizationInvitation',

    actorUid: input.actorUid,
    organizationId: input.organizationId,
    invitationId: input.invitationId,
    role: input.role,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });

export interface OrganizationMemberStatusAuditInput {
  actorUid: string;
  organizationId: string;
  targetUid: string;
  role: ORGANIZATION_ROLES;
  previousStatus: 'ACTIVE' | 'SUSPENDED';
  nextStatus: 'ACTIVE' | 'SUSPENDED' | 'LEFT';
  occurredAt: Date;
}

export const toOrganizationMemberStatusChangedAuditEvent = (
  input: OrganizationMemberStatusAuditInput & {
    requestId: string;
  },
): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'organization.member.status.changed',
    outcome: 'succeeded',
    targetType: 'organizationMembership',

    actorUid: input.actorUid,
    organizationId: input.organizationId,
    targetUid: input.targetUid,
    role: input.role,
    previousStatus: input.previousStatus,
    nextStatus: input.nextStatus,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });

export const toOrganizationOwnershipTransferredAuditEvent = (
  input: OwnershipTransferredAuditInput & {
    requestId: string;
  },
): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'organization.ownership.transferred',
    outcome: 'succeeded',
    targetType: 'organization',

    actorUid: input.actorUid,
    organizationId: input.organizationId,
    previousOwnerUid: input.actorUid,
    newOwnerUid: input.newOwnerUid,
    previousOwnerNextRole: ORGANIZATION_ROLES.ADMIN,
    newOwnerPreviousRole: input.newOwnerPreviousRole,
    newOwnerNextRole: ORGANIZATION_ROLES.OWNER,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });

export const toEventCreatedAuditEvent = (input: {
  actorUid: string;
  organizationId: string;
  targetId: string;
  requestId: string;
  occurredAt: Date;
}): AuditEvent =>
  auditEventSchema.parse({
    schemaVersion: 1,
    eventId: randomUUID(),
    action: 'event.created',
    outcome: 'succeeded',

    actorUid: input.actorUid,
    targetType: 'event',
    targetId: input.targetId,
    organizationId: input.organizationId,

    requestId: input.requestId,
    occurredAt: input.occurredAt,
  });
