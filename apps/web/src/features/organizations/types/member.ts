import type { OrganizationRole } from './permission';

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  INVITED = 'INVITED',
  REMOVED = 'REMOVED',
  SUSPENDED = 'SUSPENDED',
}

export interface UpdateMemberRolesRequest {
  roles: OrganizationRole[];
}

export interface FirebaseTimestampLike {
  _seconds?: number;
  _nanoseconds?: number;
  seconds?: number;
  nanoseconds?: number;
}

export interface OrganizationMember {
  id: string;
  email: string;
  displayName: string;
  status: MembershipStatus;
  avatarUrl?: string | null;
  roles: OrganizationRole[];
  joinedAt: string | Date | FirebaseTimestampLike;
  removedAt?: string | Date | FirebaseTimestampLike | null;
}
