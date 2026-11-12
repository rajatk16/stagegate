import { useState } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, LogOut, UserRound } from 'lucide-react';

import { useAuth } from '@/features/auth/context/auth';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdownMenu';

export const AccountMenu = ({ email }: { email: string }) => {
  const { signOut } = useAuth();
  const [failed, setFailed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const leave = async () => {
    setFailed(false);
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setFailed(true);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Account menu"
          disabled={signingOut}
          render={
            <Button
              variant="outline"
              className="min-h-11 min-w-11 rounded-full sm:px-3 cursor-pointer"
            />
          }
        >
          <UserRound aria-hidden="true" />
          {/* <span className="hidden sm:inline">Account</span> */}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-60">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
            <DropdownMenuItem
              render={<Link to="/app/account" />}
              closeOnClick
              className="min-h-11 cursor-pointer"
            >
              <UserRound aria-hidden="true" /> Account
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link to="/app" />}
              closeOnClick
              className="min-h-11 cursor-pointer"
            >
              <LayoutDashboard aria-hidden="true" /> Workspace
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={signingOut}
            onClick={() => void leave()}
            className="min-h-11 cursor-pointer"
          >
            <LogOut aria-hidden="true" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {failed && (
        <p
          role="alert"
          className="absolute top-full right-0 z-50 mt-2 w-48 rounded-md border border-border bg-popover text-sm text-destructive shadow-sm"
        >
          We couldn't sign you out. Try again.
        </p>
      )}
    </div>
  );
};
