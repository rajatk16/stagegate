import { EventRole, OrganizationRole } from '@/authorization/enums';

import { AuthenticatedUser } from './authenticatedUser.interface';

export interface RequestContext {
  user: AuthenticatedUser;
  activeOrganizationId?: string;
  activeEventId?: string;
  organizationRoles: OrganizationRole[];
  eventRoles: EventRole[];
}
