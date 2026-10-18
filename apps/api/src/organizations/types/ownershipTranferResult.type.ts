import { OrganizationMembership } from '../models';

export interface OwnershipTransferResult {
  organizationId: string;
  previousOwner: OrganizationMembership;
  newOwner: OrganizationMembership;
}
