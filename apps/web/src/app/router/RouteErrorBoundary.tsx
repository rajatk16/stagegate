import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { PageError } from '@/components/feedback';

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <PageError title={`${error.status}`} description={error.statusText} />
    );
  }
  return <PageError />;
};
