import { useAuth } from '@/features/auth';

import { CreateOrganizationContent } from '../components';

export const CreateOrganization = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return (
    <CreateOrganizationContent key={session.user.uid} user={session.user} />
  );
};
