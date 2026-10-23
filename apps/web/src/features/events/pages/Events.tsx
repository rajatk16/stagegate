import { useAuth } from '@/features/auth';
import { useActiveOrganization } from '@/features/organizations';

import { EventsContent } from '../components';

export const Events = () => {
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
