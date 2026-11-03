import { OrganizationMembership } from '../models/organizationMembership.model';

export type OrganizationTeamMember = OrganizationMembership & {
  displayName: string | null;
  email: string | null;
};

export interface OrganizationMembersPage {
  items: OrganizationTeamMember[];
  nextCursor: string | null;
}
