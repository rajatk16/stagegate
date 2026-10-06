import { z } from 'zod';

import { ORGANIZATION_ROLES } from '../../organizations';
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
  role: z.enum([
    ORGANIZATION_ROLES.ADMIN,
    ORGANIZATION_ROLES.MEMBER,
    ORGANIZATION_ROLES.VIEWER,
  ]),
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

export const auditEventSchema = z.discriminatedUnion('action', [
  profileUpdatedAuditEventSchema,
  organizationCreatedAuditEventSchema,
  organizationSettingsUpdatedAuditEventSchema,
  organizationInvitationCreatedAuditEventSchema,
  organizationMemberRoleChangedAuditEventSchema,
  organizationInvitationRevokedAuditEventSchema,
  organizationInvitationAcceptedAuditEventSchema,
]);

export type AuditEvent = z.infer<typeof auditEventSchema>;
