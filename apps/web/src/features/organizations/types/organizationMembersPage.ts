import { OrganizationMember } from './organizationMember';

export type OrganizationMembersPage = {
  items: OrganizationMember[];
  nextCursor: string | null;
};
