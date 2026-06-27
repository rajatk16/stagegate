import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui';

import { buildHomeRoute } from './routeBuilders';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  let title = 'Something went wrong';
  let description = 'An unexpected error occurred while loading this page.';

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText}`;
    description = typeof error.data === 'string' ? error.data : description;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="mt-4 text-muted-foreground">{description}</p>

        <Button asChild className="mt-8">
          <Link to={buildHomeRoute()}>Go Home</Link>
        </Button>
      </div>
    </div>
  );
};
