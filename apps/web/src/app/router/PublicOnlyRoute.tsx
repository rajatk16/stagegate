import { Navigate } from 'react-router-dom';
import type { PropsWithChildren } from 'react';

import { FullPageLoader } from '@/components/feedback';
import { useAuthInitialized, useIsAuthenticated } from '@/features/auth';

import { buildAppRoute } from './routeBuilders';

export const PublicOnlyRoute = (props: PropsWithChildren) => {
  const initialized = useAuthInitialized();
  const authenticated = useIsAuthenticated();

  if (!initialized) return <FullPageLoader title="Loading..." />;

  if (authenticated) {
    return <Navigate replace to={buildAppRoute()} />;
  }

  return <>{props.children}</>;
};
