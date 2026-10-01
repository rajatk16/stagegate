import {
  Organization,
  OrganizationMembership,
  OrganizationSlug,
} from '../models';

export interface OrganizationCreation {
  organization: Organization;
  slugReservation: OrganizationSlug;
  ownerMembership: OrganizationMembership;
}
