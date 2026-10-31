import { createHash } from 'crypto';
import { OrganizationMembership } from '../models';

export const getOrganizationMembershipKey = (
  membership: OrganizationMembership,
): string => {
  if (membership.membershipId !== null) {
    return membership.membershipId;
  }

  const identity = JSON.stringify([
    membership.organizationId,
    membership.uid,
    membership.createdAt.toISOString(),
  ]);

  return `legacy:${createHash('sha256').update(identity).digest('hex')}`;
};
