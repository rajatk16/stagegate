import { OrganizationMembership } from '../models';

export type OrganizationTeamMember = OrganizationMembership & {
  displayName: string | null;
  email: string | null;
};

export interface OrganizationMembersPage {
  items: OrganizationTeamMember[];
  nextCursor: string | null;
}
