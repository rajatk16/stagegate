import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/theme';
import { useAuthenticatedUser } from '@/features/auth';

import { LandingUserMenu } from './LandingUserMenu';

export const Navbar = () => {
  const user = useAuthenticatedUser();
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">StageGate</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!user && (
            <Button variant="ghost" asChild>
              <Link to="/login">Login/Signup</Link>
            </Button>
          )}
          {user && (
            <>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              <LandingUserMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
};
