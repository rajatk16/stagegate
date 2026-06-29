import { useEffect } from 'react';

interface UseBeforeUnloadOptions {
  enabled: boolean;
}

export const useBeforeUnload = ({ enabled }: UseBeforeUnloadOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();

      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
  }, [enabled]);
};
