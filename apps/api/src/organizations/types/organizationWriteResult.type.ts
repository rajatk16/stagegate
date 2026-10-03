import { OrganizationWithMembership } from './organizationPage.type';

export type OrganizationWriteResult = OrganizationWithMembership & {
  previousLogoPath: string | null;
};
