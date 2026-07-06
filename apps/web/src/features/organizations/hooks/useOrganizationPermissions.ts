import {
  canManageMembers,
  canEditOrganization,
  canTransferOwnership,
  canArchiveOrganization,
} from '../types';
import { useCurrentOrganizationMember } from './queries';

export const useOrganizationPermissions = (organizationSlug: string) => {
  const member = useCurrentOrganizationMember(organizationSlug);

  if (!member || !member.data) {
    return {
      roles: [],
      canManageMembers: false,
      canEditOrganization: false,
      canTransferOwnership: false,
      canArchiveOrganization: false,
    };
  }

  return {
    roles: member.data.roles,
    canManageMembers: canManageMembers(member.data.roles),
    canEditOrganization: canEditOrganization(member.data.roles),
    canTransferOwnership: canTransferOwnership(member.data.roles),
    canArchiveOrganization: canArchiveOrganization(member.data.roles),
  };
};
