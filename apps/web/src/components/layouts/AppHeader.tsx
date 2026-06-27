import { useAuthenticatedUser } from '@/features/auth';

import { Avatar, AvatarFallback } from '../ui';

const getInitials = (displayName?: string) => {
  if (!displayName) return 'U';

  return displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const AppHeader = () => {
  const user = useAuthenticatedUser();
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div />
      <Avatar>
        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
      </Avatar>
    </header>
  );
};
