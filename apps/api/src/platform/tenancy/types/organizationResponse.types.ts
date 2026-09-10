import { type MembershipRole } from './membershipRole.enum';
import { type MembershipStatus } from './membershipStatus.enum';

export interface OrganizationResponse {
  readonly organizationId: string;
  readonly name: string;
  readonly version: number;
  readonly membership: {
    readonly membershipId: string;
    readonly role: MembershipRole;
    readonly status: MembershipStatus;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}
