import { describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY, usePreferencesStore } from '@/stores/preferences.store';

describe('preferences store', () => {
  it('uses system theme by default', () => {
    expect(usePreferencesStore.getState().theme).toBe('system');
  });

  it('updates the theme', () => {
    usePreferencesStore.getState().setTheme('dark');

    expect(usePreferencesStore.getState().theme).toBe('dark');
  });

  it('toggles the sidebar', () => {
    usePreferencesStore.getState().toggleSidebar();

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);

    usePreferencesStore.getState().toggleSidebar();

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it('sets the sidebar state explicitly', () => {
    usePreferencesStore.getState().setSidebarCollapsed(true);

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it('resets preferences', () => {
    const store = usePreferencesStore.getState();

    store.setTheme('dark');
    store.setSidebarCollapsed(true);
    store.resetPreferences();

    expect(usePreferencesStore.getState().theme).toBe('system');

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });

  it('persists preferences to local storage', () => {
    usePreferencesStore.getState().setTheme('dark');

    const persisted = localStorage.getItem(PREFERENCES_STORAGE_KEY);

    expect(persisted).toContain('"theme":"dark"');
  });

  it('rehydrates valid persisted preferences', async () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: {
          theme: 'light',
          sidebarCollapsed: true,
        },
        version: 1,
      }),
    );

    await usePreferencesStore.persist.rehydrate();

    expect(usePreferencesStore.getState().theme).toBe('light');

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(true);
  });

  it('rejects malformed persisted preferences', async () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        state: {
          theme: 'invalid-theme',
          sidebarCollapsed: 'invalid-value',
        },
        version: 1,
      }),
    );

    await usePreferencesStore.persist.rehydrate();

    expect(usePreferencesStore.getState().theme).toBe('system');

    expect(usePreferencesStore.getState().sidebarCollapsed).toBe(false);
  });
});
