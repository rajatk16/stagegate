import { useEffect, type PropsWithChildren } from 'react';

import { initializeAuth } from '@/features/auth';

export const AuthProvider = (props: PropsWithChildren) => {
  useEffect(() => {
    const unsubscribe = initializeAuth();

    return unsubscribe;
  }, []);

  return <>{props.children}</>;
};
