import { Toaster as Sonner } from 'sonner';

import { usePreferencesStore } from '@/stores/preferences.store';

export const Toaster = () => {
  const theme = usePreferencesStore((state) => state.theme);

  return <Sonner theme={theme} position="bottom-right" closeButton richColors duration={4000} />;
};
