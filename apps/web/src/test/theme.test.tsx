import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ThemeProvider } from '@/app/providers/ThemeProvider';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { usePreferencesStore } from '@/stores/preferences.store';

describe('theme management', () => {
  it('applies dark mode to the document', () => {
    usePreferencesStore.getState().setTheme('dark');

    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement).toHaveClass('dark');
  });

  it('applies light mode to the document', () => {
    usePreferencesStore.getState().setTheme('light');

    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    expect(document.documentElement).not.toHaveClass('dark');
  });

  it('reacts to preference changes', () => {
    render(
      <ThemeProvider>
        <div>Content</div>
      </ThemeProvider>,
    );

    act(() => {
      usePreferencesStore.getState().setTheme('dark');
    });

    expect(document.documentElement).toHaveClass('dark');
  });

  it('cycles through theme preferences', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Theme: system. Switch to light theme',
      }),
    );

    expect(usePreferencesStore.getState().theme).toBe('light');

    await user.click(
      screen.getByRole('button', {
        name: 'Theme: light. Switch to dark theme',
      }),
    );

    expect(usePreferencesStore.getState().theme).toBe('dark');

    await user.click(
      screen.getByRole('button', {
        name: 'Theme: dark. Switch to system theme',
      }),
    );

    expect(usePreferencesStore.getState().theme).toBe('system');
  });
});
