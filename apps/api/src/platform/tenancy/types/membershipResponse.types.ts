import { type MembershipRole, type MembershipStatus } from './membership.types';

export interface MembershipResponse {
  readonly membershipId: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
