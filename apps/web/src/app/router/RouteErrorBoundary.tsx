import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { PageError } from '@/components/feedback';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <PageError
        title={`${error.status} ${error.statusText}`}
        description="An unexpected routing error occurred."
      />
    );
  }

  if (error instanceof Error) {
    return <PageError title="Application Error" description={error.message} />;
  }

  return (
    <PageError
      title="Unexpected Error"
      description="Something went wrong while rendering this page."
    />
  );
};
