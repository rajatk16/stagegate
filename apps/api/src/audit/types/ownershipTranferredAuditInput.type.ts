import { ORGANIZATION_ROLES } from '../../organizations/enums';

export interface OwnershipTransferredAuditInput {
  actorUid: string;
  organizationId: string;
  newOwnerUid: string;
  newOwnerPreviousRole: Exclude<ORGANIZATION_ROLES, ORGANIZATION_ROLES.OWNER>;
  occurredAt: Date;
}
