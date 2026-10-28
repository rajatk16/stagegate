import type { EVENT_ROLES } from '../../events/enums';

type EventMembershipAuditBase = {
  actorUid: string;
  organizationId: string;
  targetEventId: string;
  occurredAt: Date;
};

export type EventMembershipAuditInput = EventMembershipAuditBase &
  (
    | {
        action:
          | 'event.invitation.created'
          | 'event.invitation.accepted'
          | 'event.invitation.revoked';
        targetType: 'eventInvitation';
        invitationId: string;
        role: EVENT_ROLES;
      }
    | {
        action: 'event.member.joined';
        targetType: 'eventMembership';
        targetUid: string;
        role: EVENT_ROLES;
      }
    | {
        action: 'event.member.role.changed';
        targetType: 'eventMembership';
        targetUid: string;
        previousRole: EVENT_ROLES;
        nextRole: EVENT_ROLES;
      }
    | {
        action: 'event.member.status.changed';
        targetType: 'eventMembership';
        targetUid: string;
        role: EVENT_ROLES;
        previousStatus: 'ACTIVE' | 'SUSPENDED';
        nextStatus: 'ACTIVE' | 'SUSPENDED';
      }
  );
