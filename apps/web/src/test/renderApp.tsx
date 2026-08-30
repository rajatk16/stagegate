import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { appRoutes } from '../app/router';

export function renderApp(initialEntries: string[] = ['/']) {
  const router = createMemoryRouter(appRoutes, {
    initialEntries,
  });

  const user = userEvent.setup();
  const result = render(<RouterProvider router={router} />);

  return {
    ...result,
    router,
    user,
  };
}
