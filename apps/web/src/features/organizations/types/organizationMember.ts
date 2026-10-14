import { ORGANIZATION_ROLES } from './organizationRole';
import { ORGANIZATION_MEMBERSHIP_STATUSES } from './organizationMembershipStatus';

export type OrganizationMember = {
  uid: string;
  displayName: string | null;
  email: string | null;
  role: ORGANIZATION_ROLES;
  status: ORGANIZATION_MEMBERSHIP_STATUSES;
  createdAt: string;
  updatedAt: string;
  actions: {
    suspend: boolean;
    reactivate: boolean;
  };
};
