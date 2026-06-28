import { LogOut } from 'lucide-react';

import { useAuthenticatedUser, useLogout } from '@/features/auth';
import {
  Avatar,
  DropdownMenu,
  AvatarFallback,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';

const getInitials = (displayName?: string) => {
  if (!displayName) return 'U';

  return displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

export const AuthenticatedUserMenu = () => {
  const user = useAuthenticatedUser();

  const { signOut, isPending } = useLogout();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem disabled={isPending} onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
