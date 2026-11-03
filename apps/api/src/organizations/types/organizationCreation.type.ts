import { Organization } from '../models/organization.model';
import { OrganizationMembership } from '../models/organizationMembership.model';
import { OrganizationSlug } from '../models/organizationSlug.model';

export interface OrganizationCreation {
  organization: Organization;
  slugReservation: OrganizationSlug;
  ownerMembership: OrganizationMembership;
}
