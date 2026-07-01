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

export interface OrganizationMember {
  id: string;
  displayName: string;
  email: string;
  avatarUrl?: string | null;
  status: MembershipStatus;
  roles: OrganizationRole[];
  joinedAt: Date;
  removedAt?: Date | null;
}
