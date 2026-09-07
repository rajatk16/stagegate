import { type Membership } from './membership.types';
import { type Organization } from './organization.types';

export interface OrganizationContext {
  readonly organization: Organization;
  readonly membership: Membership;
}
