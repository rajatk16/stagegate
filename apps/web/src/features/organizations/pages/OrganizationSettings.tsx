import { useAuth } from '@/features/auth';

import { useActiveOrganization } from '../hooks';
import { OrganizationSettingsForm } from '../components';

export const OrganizationSettings = () => {
  const session = useAuth();
  const organization = useActiveOrganization();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <OrganizationSettingsForm
      key={`${session.user.uid}:${organization.id}`}
      user={session.user}
      organization={organization}
    />
  );
};
