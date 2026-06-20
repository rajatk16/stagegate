import { useEffect, type PropsWithChildren } from 'react';

import { initializeAuth } from '@/auth/authListener';

export const AuthProvider = (props: PropsWithChildren) => {
  useEffect(() => {
    const unsubscribe = initializeAuth();

    return unsubscribe;
  }, []);

  return <>{props.children}</>;
};
