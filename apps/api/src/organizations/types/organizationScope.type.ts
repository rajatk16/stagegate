import { OrganizationWithMembership } from './organizationPage.type';

export interface OrganizationScope extends OrganizationWithMembership {
  readonly organizationId: string;
  readonly actorUid: string;
}
