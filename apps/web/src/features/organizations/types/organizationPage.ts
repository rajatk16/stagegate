import { Organization } from './organization';

export type OrganizationPage = {
  items: Organization[];
  nextCursor: string | null;
};
