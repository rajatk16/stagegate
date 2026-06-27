import { useAuthenticatedUser, useLogout } from '@/features/auth';
import {
  Avatar,
  DropdownMenu,
  AvatarFallback,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';

export const LandingUserMenu = () => {
  const user = useAuthenticatedUser();
  const { signOut, isPending } = useLogout();

  const initials =
    user?.displayName
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ?? 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem
          disabled={isPending}
          onClick={() => {
            void signOut();
          }}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
