import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

import { buildAppRoute } from '@/app';
import {
  Avatar,
  Button,
  DropdownMenu,
  AvatarFallback,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';
import { logOut, useAuthenticatedUser } from '@/features/auth';

const getInitials = (displayName?: string) =>
  displayName
    ? displayName
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

export const AuthenticatedUserMenu = () => {
  const user = useAuthenticatedUser();

  if (!user) return null;

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" asChild>
        <Link to={buildAppRoute()}>Dashboard</Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer">
            <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={buildAppRoute()}>Dashboard</Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => logOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
