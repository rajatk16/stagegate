import { onIdTokenChanged } from 'firebase/auth';
import {
  Fragment,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';

import { firebaseAuth } from '@/lib';

import { AuthContext, AuthSession } from '../context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppQueryClient } from '@/app/query';

type Snapshot = {
  session: AuthSession;
  client: QueryClient;
  revision: number;
};

export const AuthProvider = (props: PropsWithChildren) => {
  const [snapshot, setSnapshot] = useState<Snapshot>(() => ({
    session: {
      status: 'loading',
      user: null,
    },
    client: createAppQueryClient(),
    revision: 0,
  }));

  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    return onIdTokenChanged(firebaseAuth, (user) => {
      const previous = snapshotRef.current;

      const changed =
        previous.session.status === 'loading' || previous.session.user !== user;

      const next: Snapshot = {
        session: user
          ? { status: 'authenticated', user }
          : {
              status: 'unauthenticated',
              user: null,
            },
        client: changed ? createAppQueryClient() : previous.client,
        revision: previous.revision + (changed ? 1 : 0),
      };

      snapshotRef.current = next;
      setSnapshot(next);

      if (changed) {
        void previous.client.cancelQueries();
        previous.client.clear();
      }
    });
  }, []);

  return (
    <AuthContext.Provider value={snapshot.session}>
      <QueryClientProvider client={snapshot.client}>
        <Fragment key={snapshot.revision}>{props.children}</Fragment>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};
