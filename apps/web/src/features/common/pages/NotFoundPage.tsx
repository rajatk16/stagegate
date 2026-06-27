import { Link } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

import { buildHomeRoute } from '@/app';
import { Button } from '@/components/ui';

export const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          404
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Page Not Found
        </h1>

        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn't find the page you were looking for.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Button variant="outline" onClick={() => history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link to={buildHomeRoute()}>
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
