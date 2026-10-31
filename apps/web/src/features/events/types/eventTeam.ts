export type EventRole = 'MANAGER' | 'REVIEW_CHAIR' | 'REVIEWER';

export type EventMemberStatus = 'ACTIVE' | 'SUSPENDED';

export type EventPermission =
  | 'event:read'
  | 'event:update'
  | 'event:members:read'
  | 'event:members:manage'
  | 'event:manage-status';

export type EventMember = {
  organizationId: string;
  eventId: string;
  uid: string;
  role: EventRole;
  status: EventMemberStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventAuthority =
  | {
      kind: 'ORGANIZATION_ADMIN';
    }
  | {
      kind: 'EVENT_MEMBER';
      role: EventRole;
    }
  | {
      kind: 'ORGANIZATION_READER';
    };

export type EventAccess = {
  organizationId: string;
  eventId: string;
  authority: EventAuthority;
  permissions: EventPermission[];
  membership: EventMember | null;
};

export type EventMembersPage = {
  items: EventMember[];
  nextCursor: string | null;
};

export type EventInvitation = {
  id: string;
  organizationId: string;
  eventId: string;
  recipientEmail: string;
  role: EventRole;
  status: 'PENDING';
  expiresAt: string;
  canRevoke: boolean;
};

export type EventInvitationsPage = {
  items: EventInvitation[];
  nextCursor: string | null;
};

export type CreatedEventInvitation = Omit<EventInvitation, 'canRevoke'> & {
  scopeType: 'EVENT';
  emailStatus: 'ACCEPTED' | 'CAPTURED';
};

export type CreateEventInvitationInput = {
  email: string;
  role: EventRole;
};
