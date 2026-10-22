import { z } from 'zod';

import { ORGANIZATION_ROLES } from '../../organizations/enums';
import { ORGANIZATION_SETTINGS_FIELDS, PROFILE_FIELDS } from '../enums';

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
    fields: z.array(z.nativeEnum(PROFILE_FIELDS)).min(1).max(5),
  })
  .strict();

export const organizationCreatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.created'),
    targetType: z.literal('organization'),
    targetId: z.string().uuid(),
  })
  .strict();

export const organizationSettingsUpdatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.settings.updated'),
    targetType: z.literal('organization'),
    targetId: z.string().uuid(),
    fields: z
      .array(z.nativeEnum(ORGANIZATION_SETTINGS_FIELDS))
      .min(1)
      .max(Object.values(ORGANIZATION_SETTINGS_FIELDS).length),
  })
  .strict();

export const organizationMemberRoleChangedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.member.role.changed'),
    targetType: z.literal('organizationMembership'),
    organizationId: z.string().uuid(),
    targetUid: z.string().min(1).max(128),
    previousRole: z.nativeEnum(ORGANIZATION_ROLES),
    nextRole: z.nativeEnum(ORGANIZATION_ROLES),
  })
  .strict();

const organizationInvitationAuditBaseSchema = auditBaseSchema.extend({
  targetType: z.literal('organizationInvitation'),
  invitationId: z.string().uuid(),
  organizationId: z.string().uuid(),
  role: z.nativeEnum(ORGANIZATION_ROLES),
});

export const organizationInvitationCreatedAuditEventSchema =
  organizationInvitationAuditBaseSchema
    .extend({
      action: z.literal('organization.invitation.created'),
    })
    .strict();

export const organizationInvitationAcceptedAuditEventSchema =
  organizationInvitationAuditBaseSchema
    .extend({
      action: z.literal('organization.invitation.accepted'),
    })
    .strict();

export const organizationInvitationRevokedAuditEventSchema =
  organizationInvitationAuditBaseSchema
    .extend({
      action: z.literal('organization.invitation.revoked'),
    })
    .strict();

export const organizationMemberStatusChangedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.member.status.changed'),
    targetType: z.literal('organizationMembership'),
    organizationId: z.string().uuid(),
    targetUid: z.string().min(1).max(128),
    role: z.nativeEnum(ORGANIZATION_ROLES),
    previousStatus: z.enum(['ACTIVE', 'SUSPENDED']),
    nextStatus: z.enum(['ACTIVE', 'SUSPENDED', 'LEFT']),
  })
  .strict();

export const organizationOwnershipTransferredAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('organization.ownership.transferred'),
    targetType: z.literal('organization'),
    organizationId: z.string().uuid(),
    previousOwnerUid: z.string().min(1).max(128),
    newOwnerUid: z.string().min(1).max(128),
    previousOwnerNextRole: z.literal(ORGANIZATION_ROLES.ADMIN),
    newOwnerPreviousRole: z.enum([
      ORGANIZATION_ROLES.ADMIN,
      ORGANIZATION_ROLES.MEMBER,
      ORGANIZATION_ROLES.VIEWER,
    ]),
    newOwnerNextRole: z.literal(ORGANIZATION_ROLES.OWNER),
  })
  .strict();

export const eventCreatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('event.created'),
    targetType: z.literal('event'),
    organizationId: z.string().uuid(),
    targetId: z.string().uuid(),
  })
  .strict();

export const eventUpdatedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('event.updated'),
    targetType: z.literal('event'),
    organizationId: z.string().uuid(),
    targetId: z.string().uuid(),
    fields: z.array(z.literal('name')).length(1),
  })
  .strict();

export const eventStatusChangedAuditEventSchema = auditBaseSchema
  .extend({
    action: z.literal('event.status.changed'),
    targetType: z.literal('event'),
    organizationId: z.string().uuid(),
    targetId: z.string().uuid(),
    previousStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    nextStatus: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  })
  .strict();

export const auditEventSchema = z.discriminatedUnion('action', [
  eventCreatedAuditEventSchema,
  eventUpdatedAuditEventSchema,
  profileUpdatedAuditEventSchema,
  eventStatusChangedAuditEventSchema,
  organizationCreatedAuditEventSchema,
  organizationSettingsUpdatedAuditEventSchema,
  organizationInvitationCreatedAuditEventSchema,
  organizationMemberRoleChangedAuditEventSchema,
  organizationInvitationRevokedAuditEventSchema,
  organizationInvitationAcceptedAuditEventSchema,
  organizationMemberStatusChangedAuditEventSchema,
  organizationOwnershipTransferredAuditEventSchema,
]);

export type AuditEvent = z.infer<typeof auditEventSchema>;
