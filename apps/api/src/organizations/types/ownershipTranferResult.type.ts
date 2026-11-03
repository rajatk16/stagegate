import { OrganizationMembership } from '../models/organizationMembership.model';

export interface OwnershipTransferResult {
  organizationId: string;
  previousOwner: OrganizationMembership;
  newOwner: OrganizationMembership;
}
