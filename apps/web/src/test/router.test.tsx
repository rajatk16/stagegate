import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { routes } from '@/app/router/Routes';

function renderRoute(path: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [path],
  });

  return {
    router,

    ...render(
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>,
    ),
  };
}

describe('StageGate routing', () => {
  it('renders the public landing page', async () => {
    renderRoute('/');

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /from call for papers to conference stage/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders the organization workspace', async () => {
    renderRoute('/app');

    expect(
      await screen.findByRole('heading', {
        name: 'Welcome to StageGate',
      }),
    ).toBeInTheDocument();
  });

  it('renders the speaker dashboard', async () => {
    renderRoute('/speaker');

    expect(
      await screen.findByRole('heading', {
        name: 'Speaker dashboard',
      }),
    ).toBeInTheDocument();
  });

  it('renders the speaker proposals page', async () => {
    renderRoute('/speaker/proposals');

    expect(
      await screen.findByRole('heading', {
        name: 'My proposals',
      }),
    ).toBeInTheDocument();
  });

  it('renders the unauthorized page', async () => {
    renderRoute('/unauthorized');

    expect(
      await screen.findByRole('heading', {
        name: 'Access denied',
      }),
    ).toBeInTheDocument();
  });

  it('renders a not-found page for unknown routes', async () => {
    renderRoute('/unknown-page');

    expect(
      await screen.findByRole('heading', {
        name: 'Page not found',
      }),
    ).toBeInTheDocument();
  });

  it('navigates from the landing page to the organizer workspace', async () => {
    const user = userEvent.setup();

    renderRoute('/');

    await user.click(
      await screen.findByRole('link', {
        name: 'Explore organizer workspace',
      }),
    );

    expect(
      await screen.findByRole('heading', {
        name: 'Welcome to StageGate',
      }),
    ).toBeInTheDocument();
  });

  it('provides a main content landmark', async () => {
    renderRoute('/app');

    await screen.findByRole('heading', {
      name: 'Welcome to StageGate',
    });

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('exposes the active navigation item', async () => {
    renderRoute('/speaker/proposals');

    await screen.findByRole('heading', {
      name: 'My proposals',
    });

    expect(
      screen.getByRole('link', {
        name: 'My proposals',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
