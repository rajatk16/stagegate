import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

import { usePreferencesStore } from '@/stores/preferences.store';

Object.defineProperty(window, 'matchMedia', {
  writable: true,

  value: vi.fn((query: string): MediaQueryList => {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    };
  }),
});

beforeEach(() => {
  usePreferencesStore.getState().resetPreferences();
  localStorage.clear();

  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = '';
});

afterEach(() => {
  cleanup();
});
