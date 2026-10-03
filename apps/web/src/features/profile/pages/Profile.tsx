import { useAuth } from '@/features/auth';

import { ProfileLoader } from '../components';

export const Profile = () => {
  const session = useAuth();

  if (session.status !== 'authenticated') {
    return null;
  }

  return <ProfileLoader key={session.user.uid} user={session.user} />;
};
