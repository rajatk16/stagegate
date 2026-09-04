export type MembershipRole = 'OWNER';
export type MembershipStatus = 'ACTIVE';

export interface Membership {
  readonly membershipId: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly version: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
