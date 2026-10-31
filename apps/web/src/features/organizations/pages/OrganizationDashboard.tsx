import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { EventsContent } from '@/features/events';

export const OrganizationDashboard = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <EventsContent
      key={`${session.user.uid}:${organization.id}`}
      user={session.user}
      organization={organization}
    />
  );
};
