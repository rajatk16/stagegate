import { Organization, OrganizationMembership } from '@/organizations/entities';

import { AuthenticatedUser } from './authenticatedUser.interface';

export interface RequestContext {
  user: AuthenticatedUser;
  organization?: Organization;
  organizationMembership?: OrganizationMembership;
}
