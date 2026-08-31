import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '../app/router';
import { AuthContext, type AuthState } from '../lib/auth';

export const renderApp = (
  initialEntries: string[] = ['/'],
  authState: AuthState = { status: 'unauthenticated', user: null },
) => {
  const router = createMemoryRouter(appRoutes, {
    initialEntries,
  });

  const user = userEvent.setup();
  const result = render(
    <AuthContext.Provider value={authState}>
      <RouterProvider router={router} />
    </AuthContext.Provider>,
  );

  return {
    ...result,
    router,
    user,
  };
};
