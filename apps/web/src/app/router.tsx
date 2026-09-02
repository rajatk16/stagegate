import { createBrowserRouter, type RouteObject } from 'react-router';

import { routes } from './routes';
import { EventsPage } from '../pages/EventsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SettingsPage } from '../pages/SettingsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AppShell } from '../components/layout/AppShell';
import { LoginPage, SignUpPage } from '../features/auth/pages';

export const appRoutes: RouteObject[] = [
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.signUp,
    element: <SignUpPage />,
  },
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: routes.events,
        element: <EventsPage />,
      },
      {
        path: routes.settings,
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
