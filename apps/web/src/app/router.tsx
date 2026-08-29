import { createBrowserRouter } from 'react-router';

import { routes } from './routes';
import { EventsPage } from '../pages/EventsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { SettingsPage } from '../pages/SettingsPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AppShell } from '../components/layout/AppShell';

export const router = createBrowserRouter([
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
]);
