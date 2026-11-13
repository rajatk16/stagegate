import z from 'zod';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const PREFERENCES_STORAGE_KEY = 'stagegate:preferences';

export const themeSchema = z.enum(['light', 'dark', 'system']);

export type Theme = z.infer<typeof themeSchema>;

const persistedPreferencesSchema = z.object({
  theme: themeSchema,
  sidebarCollapsed: z.boolean(),
});

interface PreferencesState {
  theme: Theme;
  sidebarCollapsed: boolean;
}

interface PreferencesActions {
  setTheme: (theme: Theme) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  resetPreferences: () => void;
}

type PreferencesStore = PreferencesState & PreferencesActions;

const defaultPreferences: PreferencesState = {
  theme: 'system',
  sidebarCollapsed: false,
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      ...defaultPreferences,
      setTheme: (theme) => {
        set({ theme });
      },
      setSidebarCollapsed: (sidebarCollapsed) => {
        set({ sidebarCollapsed });
      },
      toggleSidebar: () => {
        set((state) => ({
          sidebarCollapsed: !state.sidebarCollapsed,
        }));
      },
      resetPreferences: () => {
        set(defaultPreferences);
      },
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      version: 1,

      storage: createJSONStorage(() => localStorage),

      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),

      merge: (persistedState, currentState) => {
        const result = persistedPreferencesSchema.safeParse(persistedState);

        if (!result.success) {
          return currentState;
        }

        return {
          ...currentState,
          ...result.data,
        };
      },

      migrate: (persistedState) => {
        const result = persistedPreferencesSchema.safeParse(persistedState);

        return result.success ? result.data : defaultPreferences;
      },
    },
  ),
);
