import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { ActivityContent } from '../components';

export const OrganizationActivity = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <ActivityContent
      key={`${session.user.uid}:${organization.id}`}
      user={session.user}
      organization={organization}
    />
  );
};
