import { onIdTokenChanged } from 'firebase/auth';
import { useEffect, useState, type PropsWithChildren } from 'react';

import { firebaseAuth } from '../../lib/firebaseClient';
import { AuthContext, type AuthState, consumeSessionEndReason } from '../../lib/auth';

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<AuthState>({
    status: 'loading',
    user: null,
  });

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onIdTokenChanged(firebaseAuth, (user) => {
      if (!isActive) {
        return;
      }

      if (user === null) {
        const requestedReason = consumeSessionEndReason();

        setState((previousState) => ({
          status: 'unauthenticated',
          user: null,
          reason:
            requestedReason ?? (previousState.status === 'authenticated' ? 'expired' : 'initial'),
        }));

        return;
      }

      setState({
        status: 'authenticated',
        user: {
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
        },
      });
    });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
