import {
  Avatar,
  DropdownMenu,
  AvatarFallback,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui';

export const UserMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar>
        <AvatarFallback>RS</AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuItem>Profile</DropdownMenuItem>
      <DropdownMenuItem>Account Settings</DropdownMenuItem>
      <DropdownMenuItem>Logout</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
