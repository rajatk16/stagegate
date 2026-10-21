import { OrganizationEvent } from './organizationEvent';

export type OrganizationEventsPage = {
  items: OrganizationEvent[];
  nextCursor: string | null;
};
