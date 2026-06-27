import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

import { buildLoginRoute } from '@/app/router';
import { useIsAuthenticated } from '@/features/auth';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/components/ui';

import { publicNavigation } from './publicNavigation';
import { ThemeToggle } from '@/components/theme';

export const MobileNavigation = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right">
        <div className="mt-8 flex flex-col gap-6">
          {publicNavigation.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-base font-medium"
            >
              {item.label}
            </a>
          ))}

          {!isAuthenticated && (
            <Button asChild>
              <Link to={buildLoginRoute()}>Get Started</Link>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
};
