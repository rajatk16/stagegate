import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../test/renderApp';

describe('application routing', () => {
  it('renders the dashboard inside the application shell', () => {
    renderApp();

    expect(screen.getByRole('link', { name: 'StageGate' })).toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Dashboard',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('navigates to the events page without reloading', async () => {
    const { router, user } = renderApp();

    await user.click(
      screen.getByRole('link', {
        name: 'Events',
      }),
    );

    expect(router.state.location.pathname).toBe('/events');

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Events',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Events',
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('renders settings at its direct URL', () => {
    renderApp(['/settings']);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Settings',
      }),
    ).toBeInTheDocument();
  });

  it('renders the not-found page for an unknown URL', () => {
    renderApp(['/unknown-page']);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Page not found',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', {
        name: 'Return to dashboard',
      }),
    ).toHaveAttribute('href', '/');
  });
});
