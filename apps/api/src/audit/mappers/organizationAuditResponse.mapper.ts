import type { AuditEvent } from '../models';
import { getAuditOrganizationId } from '../utils';
import { OrganizationAuditEventResponseDto } from '../dtos';
import { DiagnosticError } from '../../observalibility/errors';

const toDetails = (event: AuditEvent): Record<string, string | string[]> => {
  switch (event.action) {
    case 'organization.created':
      return {};

    case 'organization.settings.updated':
      return {
        fields: [...event.fields],
      };

    case 'organization.member.role.changed':
      return {
        targetUid: event.targetUid,
        previousRole: event.previousRole,
        nextRole: event.nextRole,
      };

    case 'organization.member.status.changed':
      return {
        targetUid: event.targetUid,
        role: event.role,
        previousStatus: event.previousStatus,
        nextStatus: event.nextStatus,
      };

    case 'organization.invitation.created':
    case 'organization.invitation.accepted':
    case 'organization.invitation.revoked':
      return {
        invitationId: event.invitationId,
        role: event.role,
      };

    case 'organization.ownership.transferred':
      return {
        previousOwnerUid: event.previousOwnerUid,
        newOwnerUid: event.newOwnerUid,
        previousOwnerNextRole: event.previousOwnerNextRole,
        newOwnerPreviousRole: event.newOwnerPreviousRole,
        newOwnerNextRole: event.newOwnerNextRole,
      };

    case 'user.profile.updated':
      throw new DiagnosticError('AUDIT_SCOPE_MISMATCH');

    case 'event.created':
      return {
        targetId: event.targetId,
      };
    case 'event.updated':
      return {
        targetId: event.targetId,
        fields: [...event.fields],
      };

    case 'event.status.changed':
      return {
        targetId: event.targetId,
        previousStatus: event.previousStatus,
        nextStatus: event.nextStatus,
      };
  }
};

export const toOrganizationAuditEventResponseDto = (
  event: AuditEvent,
  organizationId: string,
): OrganizationAuditEventResponseDto => {
  if (getAuditOrganizationId(event) !== organizationId) {
    throw new DiagnosticError('AUDIT_SCOPE_MISMATCH');
  }

  return {
    eventId: event.eventId,
    organizationId,
    action: event.action,
    actorUid: event.actorUid,
    occurredAt: event.occurredAt.toISOString(),
    outcome: event.outcome,
    details: toDetails(event),
    actorDisplayName: null,
    actorEmail: null,
  };
};
