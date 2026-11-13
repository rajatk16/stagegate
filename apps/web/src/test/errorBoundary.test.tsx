import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AppErrorBoundary } from '@/components/errors/AppErrorBoundary';

function BrokenComponent(): never {
  throw new Error('Sensitive internal error details');
}

describe('application error boundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <AppErrorBoundary>
        <div>Application content</div>
      </AppErrorBoundary>,
    );

    expect(screen.getByText('Application content')).toBeInTheDocument();
  });

  it('renders a recovery screen when a component throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Something went wrong',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: 'Reload application',
      }),
    ).toBeInTheDocument();
  });

  it('does not expose internal error details', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenComponent />
      </AppErrorBoundary>,
    );

    expect(screen.queryByText('Sensitive internal error details')).not.toBeInTheDocument();
  });
});
