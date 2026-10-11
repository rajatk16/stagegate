import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import {
  OrganizationInvitations,
  OrganizationMembersContent,
} from '../components';
import { hasOrganizationCapability } from '../services';

export const OrganizationMembers = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  const canManageMembers = hasOrganizationCapability(
    organization,
    'organization:members:manage',
  );

  return (
    <div key={`${session.user.uid}:${organization.id}`} className="space-y-6">
      <OrganizationMembersContent
        key={`${session.user.uid}:${organization.id}`}
        user={session.user}
        organization={organization}
      />
      {canManageMembers && (
        <OrganizationInvitations
          user={session.user}
          organization={organization}
        />
      )}
    </div>
  );
};
