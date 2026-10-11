import { OrganizationInvitation } from './organizationInvitation';

export type PendingInvitation = OrganizationInvitation & {
  canRevoke: boolean;
};
