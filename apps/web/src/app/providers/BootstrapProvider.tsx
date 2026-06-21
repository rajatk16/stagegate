import { useEffect, type PropsWithChildren } from 'react';

import { bootstrapApp } from '@/bootstrap/api';
import { useAuthStore } from '@/auth/authStore';
import { useBootstrapStore } from '@/bootstrap/store';

export const BootstrapProvider = (props: PropsWithChildren) => {
  const authenticatedUser = useAuthStore((state) => state.authenticatedUser);

  const setInitialized = useBootstrapStore((state) => state.setInitialized);

  useEffect(() => {
    const bootstrap = async () => {
      if (!authenticatedUser) {
        setInitialized(false);
        return;
      }

      try {
        await bootstrapApp();
        setInitialized(true);
      } catch {
        setInitialized(false);
      }
    };

    void bootstrap();
  }, [authenticatedUser, setInitialized]);

  return <>{props.children}</>;
};
