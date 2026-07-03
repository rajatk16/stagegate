import { Link } from 'react-router-dom';

import { Button } from '@/components/ui';
import { ThemeToggle } from '@/components/theme';
import { useIsAuthenticated } from '@/features/auth';
import { buildHomeRoute, buildLoginRoute } from '@/app/router';

import { AuthenticatedUserMenu } from './AuthenticatedUserMenu';

export const PublicNavbar = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to={buildHomeRoute()} className="text-xl font-bold">
          StageGate
        </Link>

        <div className="items-center gap-3 flex">
          <ThemeToggle />
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link to={buildLoginRoute()}>Login</Link>
              </Button>

              <Button asChild>
                <Link to={buildLoginRoute()}>Get Started</Link>
              </Button>
            </>
          ) : (
            <AuthenticatedUserMenu />
          )}
        </div>
      </div>
    </header>
  );
};
