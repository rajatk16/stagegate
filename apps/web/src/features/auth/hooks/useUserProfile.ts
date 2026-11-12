import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/auth';

export const userProfileKey = (userId: string | null) => [
  'user-profile',
  userId,
];

export const useUserProfile = () => {
  const { session, getUserProfile } = useAuth();
  const userId = session.status === 'active' ? session.identity.userId : null;
  return useQuery({
    queryKey: userProfileKey(userId),
    enabled: userId !== null,
    queryFn: ({ signal }) => getUserProfile(signal),
    refetchOnWindowFocus: false,
  });
};
