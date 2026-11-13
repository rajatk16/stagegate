import { AlertCircle } from 'lucide-react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

import { Button } from '../ui/Button';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  const status = isRouteErrorResponse(error) ? error.status : 500;

  const title =
    status === 404
      ? 'Page not found'
      : status === 403
        ? 'Access Denied'
        : 'Unable to load this page.';

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex min-h-[60vh] items-center justify-center p-6"
    >
      <div role="alert" className="max-w-md space-y-4 text-center">
        <AlertCircle className="mx-auto size-12 text-destructive" aria-hidden="true" />

        <p className="text-sm font-medium text-muted-foreground">Error {status}</p>

        <h1 className="text-2xl font-semibold">{title}</h1>

        <p className="text-muted-foreground">
          The requested page could not be displayed. Return home or reload the page.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/">Return home</Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              window.location.reload();
            }}
          >
            Reload page
          </Button>
        </div>
      </div>
    </main>
  );
};
