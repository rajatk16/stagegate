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

  // Included by the roster endpoint.
  // Add/update responses may omit them.
  organizationStatus?: EventMemberStatus;
  effectiveStatus?: EventMemberStatus;
};

export type EventAuthority =
  | {
      kind: 'ORGANIZATION_ADMIN';
    }
  | {
      kind: 'EVENT_MEMBER';
      role: EventRole;
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

export type AddEventMemberInput = {
  uid: string;
  role: EventRole;
};
