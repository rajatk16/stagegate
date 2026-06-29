import { createBrowserRouter } from 'react-router-dom';

import { LoginPage } from '@/features/auth';
import { LandingPage } from '@/features/landing';
import { Page, PageContent } from '@/components/page';
import { AccessDenied, NotFound } from '@/components/states';
import { AppLayout, PublicLayout } from '@/components/layouts';

import { LazyRoute } from './LazyRoute';
import { RoutePaths } from './routePaths';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RouteErrorBoundary } from './RouteErrorBoundary';

export const router = createBrowserRouter([
  {
    path: RoutePaths.HOME,
    element: <PublicLayout />,
    handle: {
      title: 'Home',
    },
    children: [
      {
        path: RoutePaths.HOME,
        element: <LandingPage />,
      },
    ],
  },
  {
    element: <PublicLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: RoutePaths.LOGIN,
        element: (
          <PublicOnlyRoute>
            <LazyRoute>
              <LoginPage />
            </LazyRoute>
          </PublicOnlyRoute>
        ),
        handle: {
          title: 'Login',
          publicOnly: true,
        },
      },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [],
  },
  {
    path: RoutePaths.NOT_FOUND,
    element: <NotFound />,
  },
  {
    path: '/403',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: (
          <Page>
            <PageContent>
              <AccessDenied />
            </PageContent>
          </Page>
        ),
      },
    ],
  },
]);
