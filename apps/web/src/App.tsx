import { RouterProvider } from 'react-router';

import { AppProviders } from './app/providers/AppProviders';
import { router } from './app/router/Router';

export const App = () => (
  <AppProviders>
    <RouterProvider router={router} />
  </AppProviders>
);
