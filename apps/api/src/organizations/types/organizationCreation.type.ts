import {
  Organization,
  OrganizationSlug,
  OrganizationMembership,
} from '../models';

export interface OrganizationCreation {
  organization: Organization;
  slugReservation: OrganizationSlug;
  ownerMembership: OrganizationMembership;
}
