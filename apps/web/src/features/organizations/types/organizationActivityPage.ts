import { OrganizationActivityEvent } from './organizationActivityEvent';

export type OrganizationActivityPage = {
  items: OrganizationActivityEvent[];
  nextCursor: string | null;
};
