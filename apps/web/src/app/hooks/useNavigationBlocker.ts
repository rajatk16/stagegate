import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseNavigationBlockerOptions {
  enabled: boolean;
  onBlock: () => void;
}

export const useNavigationBlocker = ({
  enabled,
  onBlock,
}: UseNavigationBlockerOptions) => {
  const blocker = useBlocker(enabled);

  useEffect(() => {
    if (blocker.state === 'blocked') {
      onBlock();
    }
  }, [blocker.state, onBlock]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled]);

  return blocker;
};
