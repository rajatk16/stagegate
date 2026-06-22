import { useEffect, type PropsWithChildren } from 'react';

import { useAuthStore } from '@/features/auth';
import { bootstrapApp, useBootstrapStore } from '@/features/bootstrap';

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
