import { Link } from 'react-router';

import { paths } from '@/app/router/paths';
import { Button } from '@/components/ui/Button';

export const NotFoundPage = () => (
  <div className="flex min-h-[65vh] items-center justify-center px-6 py-16">
    <div className="max-w-md space-y-4 text-center">
      <p className="text-6xl font-bold text-primary">404</p>

      <h1 className="text-2xl font-semibold">Page not found</h1>

      <p className="text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>

      <Button asChild>
        <Link to={paths.home}>Return home</Link>
      </Button>
    </div>
  </div>
);
