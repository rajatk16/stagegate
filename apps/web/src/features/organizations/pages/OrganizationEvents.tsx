import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { OrganizationEventsContent } from '../components';

export const OrganizationEvents = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <OrganizationEventsContent
      key={`${session.user.uid}:${organization.id}`}
      user={session.user}
      organization={organization}
    />
  );
};
