import { Event, EventMembership } from '@/events';
import { Organization, OrganizationMembership } from '@/organizations';

import { AuthenticatedUser } from './authenticatedUser.interface';

export interface RequestContext {
  event?: Event;
  user: AuthenticatedUser;
  organization?: Organization;
  eventMembership?: EventMembership;
  organizationMembership?: OrganizationMembership;
}
