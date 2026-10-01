import { Organization, OrganizationMembership } from '../models';

export interface OrganizationMembershipPage {
  items: OrganizationMembership[];
  hasMore: boolean;
}

export interface OrganizationWithMembership {
  organization: Organization;
  membership: OrganizationMembership;
}

export interface MyOrganizationsPage {
  items: OrganizationWithMembership[];
  nextCursor: string | null;
}
