import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { OrganizationMembersContent } from '../components';

export const OrganizationMembers = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <OrganizationMembersContent
      key={`${session.user.uid}:${organization.id}`}
      user={session.user}
      organization={organization}
    />
  );
};
