import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { appRoutes } from '../app/router';
import { AuthContext, type AuthState } from '../lib/auth';

type InitialEntries = NonNullable<Parameters<typeof createMemoryRouter>[1]>['initialEntries'];

export const renderApp = (
  initialEntries: InitialEntries = ['/'],
  authState: AuthState = { status: 'unauthenticated', user: null, reason: 'initial' },
) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries,
  });
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const user = userEvent.setup();
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authState}>
        <RouterProvider router={router} />
      </AuthContext.Provider>
    </QueryClientProvider>,
  );

  return {
    ...result,
    queryClient,
    router,
    user,
  };
};
